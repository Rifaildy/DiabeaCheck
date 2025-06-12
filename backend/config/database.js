const mysql = require("mysql2/promise")
const logger = require("../utils/logger")

class Database {
  constructor() {
    this.connection = null
    this.config = {
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "diabeacheck",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Removed SSL configuration as it's not supported by the free database
    }
  }

  async connect() {
    try {
      logger.info(`Connecting to MySQL database at ${this.config.host}:${this.config.port}...`)

      // For Vercel deployment, we'll create a new connection for each request
      if (process.env.NODE_ENV === "production") {
        logger.info("Running in production mode - will create connections on demand")
        return true
      }

      this.connection = await mysql.createConnection(this.config)

      logger.info("✅ Database connection established successfully")
      return this.connection
    } catch (error) {
      logger.error("❌ Database connection failed:", error)
      throw new Error("Database connection failed")
    }
  }

  async query(sql, params = []) {
    try {
      // For Vercel serverless functions, create a new connection for each query
      if (process.env.NODE_ENV === "production" || !this.connection) {
        const connection = await mysql.createConnection(this.config)
        const [results] = await connection.execute(sql, params)
        await connection.end()
        return results
      }

      // For development, use the persistent connection
      const [results] = await this.connection.execute(sql, params)
      return results
    } catch (error) {
      logger.error(`Error executing query: ${sql}`, error)
      throw error
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.end()
        logger.info("Database connection closed")
      } catch (error) {
        logger.error("Error closing database connection:", error)
      } finally {
        this.connection = null
      }
    }
  }
}

module.exports = new Database()
