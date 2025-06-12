const mysql = require("mysql2/promise")

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  let databaseStatus = "not checked"
  let databaseError = null

  // Test database connection
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "sql12.freesqldatabase.com",
      port: Number.parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "sql12784318",
      password: process.env.DB_PASSWORD || "MqKHL7mIcv",
      database: process.env.DB_NAME || "sql12784318",
      connectTimeout: 10000,
    })

    // Test with a simple query
    await connection.execute("SELECT 1 as test")
    await connection.end()
    databaseStatus = "connected"
  } catch (error) {
    databaseStatus = "error"
    databaseError = error.message
    console.error("Database health check failed:", error)
  }

  // Health check response
  const healthData = {
    status: databaseStatus === "connected" ? "OK" : "WARNING",
    message: databaseStatus === "connected" ? "Server is healthy" : "Server running but database issues",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: databaseStatus,
      host: process.env.DB_HOST || "sql12.freesqldatabase.com",
      database: process.env.DB_NAME || "sql12784318",
      ...(databaseError && { error: databaseError }),
    },
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
  }

  // Return appropriate status code
  const statusCode = databaseStatus === "connected" ? 200 : 503
  res.status(statusCode).json(healthData)
}
