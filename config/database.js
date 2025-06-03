const mysql = require("mysql2/promise")
const logger = require("../utils/logger")

class Database {
  constructor() {
    this.pool = null
    this.isConnected = false
  }

  async connect() {
    try {
      if (this.isConnected) {
        return this.pool
      }

      const config = {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "diabeacheck_db",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        charset: "utf8mb4",
        timezone: "+00:00",
      }

      this.pool = mysql.createPool(config)

      // Test connection
      const connection = await this.pool.getConnection()
      await connection.ping()
      connection.release()

      this.isConnected = true
      logger.info("✅ Database connected successfully")

      return this.pool
    } catch (error) {
      logger.error("❌ Database connection failed:", error)
      throw new Error("Database connection failed")
    }
  }

  async disconnect() {
    try {
      if (this.pool) {
        await this.pool.end()
        this.isConnected = false
        logger.info("Database disconnected")
      }
    } catch (error) {
      logger.error("Error disconnecting from database:", error)
    }
  }

  async query(sql, params = []) {
    try {
      if (!this.isConnected) {
        await this.connect()
      }

      const [rows] = await this.pool.execute(sql, params)
      return rows
    } catch (error) {
      logger.error("Database query error:", { sql, params, error: error.message })
      throw error
    }
  }

  async transaction(callback) {
    const connection = await this.pool.getConnection()

    try {
      await connection.beginTransaction()

      const result = await callback(connection)

      await connection.commit()
      return result
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // Helper methods for common operations
  async findById(table, id) {
    const sql = `SELECT * FROM ${table} WHERE id = ?`
    const rows = await this.query(sql, [id])
    return rows[0] || null
  }

  async findOne(table, conditions = {}) {
    const keys = Object.keys(conditions)
    const values = Object.values(conditions)

    if (keys.length === 0) {
      throw new Error("Conditions are required for findOne")
    }

    const whereClause = keys.map((key) => `${key} = ?`).join(" AND ")
    const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`

    const rows = await this.query(sql, values)
    return rows[0] || null
  }

  async findMany(table, conditions = {}, options = {}) {
    const keys = Object.keys(conditions)
    const values = Object.values(conditions)

    let sql = `SELECT * FROM ${table}`

    if (keys.length > 0) {
      const whereClause = keys.map((key) => `${key} = ?`).join(" AND ")
      sql += ` WHERE ${whereClause}`
    }

    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`
    }

    if (options.limit) {
      sql += ` LIMIT ${options.limit}`
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`
      }
    }

    return await this.query(sql, values)
  }

  async insert(table, data) {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map(() => "?").join(", ")

    const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`
    const result = await this.query(sql, values)

    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
    }
  }

  async update(table, data, conditions) {
    const dataKeys = Object.keys(data)
    const dataValues = Object.values(data)
    const conditionKeys = Object.keys(conditions)
    const conditionValues = Object.values(conditions)

    if (conditionKeys.length === 0) {
      throw new Error("Conditions are required for update")
    }

    const setClause = dataKeys.map((key) => `${key} = ?`).join(", ")
    const whereClause = conditionKeys.map((key) => `${key} = ?`).join(" AND ")

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`
    const result = await this.query(sql, [...dataValues, ...conditionValues])

    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    }
  }

  async delete(table, conditions) {
    const keys = Object.keys(conditions)
    const values = Object.values(conditions)

    if (keys.length === 0) {
      throw new Error("Conditions are required for delete")
    }

    const whereClause = keys.map((key) => `${key} = ?`).join(" AND ")
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`

    const result = await this.query(sql, values)
    return {
      affectedRows: result.affectedRows,
    }
  }

  async count(table, conditions = {}) {
    const keys = Object.keys(conditions)
    const values = Object.values(conditions)

    let sql = `SELECT COUNT(*) as count FROM ${table}`

    if (keys.length > 0) {
      const whereClause = keys.map((key) => `${key} = ?`).join(" AND ")
      sql += ` WHERE ${whereClause}`
    }

    const rows = await this.query(sql, values)
    return rows[0].count
  }
}

// Export singleton instance
module.exports = new Database()
