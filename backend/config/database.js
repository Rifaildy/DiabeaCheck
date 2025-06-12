const mysql = require("mysql2/promise")

class Database {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || "sql12.freesqldatabase.com",
      port: Number.parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "sql12784318",
      password: process.env.DB_PASSWORD || "MqKHL7mIcv",
      database: process.env.DB_NAME || "sql12784318",
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    }
  }

  async query(sql, params = []) {
    let connection
    try {
      // Create a new connection for each query (serverless-friendly)
      connection = await mysql.createConnection(this.config)
      const [results] = await connection.execute(sql, params)
      return results
    } catch (error) {
      console.error(`Database query error: ${sql}`, error)
      throw error
    } finally {
      if (connection) {
        try {
          await connection.end()
        } catch (closeError) {
          console.error("Error closing connection:", closeError)
        }
      }
    }
  }

  // Helper methods
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
}

module.exports = new Database()
