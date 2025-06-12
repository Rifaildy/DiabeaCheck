const mysql = require("mysql2/promise")

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "sql12.freesqldatabase.com",
      port: Number.parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "sql12784318",
      password: process.env.DB_PASSWORD || "MqKHL7mIcv",
      database: process.env.DB_NAME || "sql12784318",
      connectTimeout: 10000,
    })

    // Test various database operations
    const tests = []

    // Test 1: Basic connection
    try {
      await connection.execute("SELECT 1 as test")
      tests.push({ test: "Basic Connection", status: "✅ PASS" })
    } catch (error) {
      tests.push({ test: "Basic Connection", status: "❌ FAIL", error: error.message })
    }

    // Test 2: Show tables
    try {
      const [tables] = await connection.execute("SHOW TABLES")
      tests.push({
        test: "Show Tables",
        status: "✅ PASS",
        result: `Found ${tables.length} tables`,
        tables: tables.map((t) => Object.values(t)[0]),
      })
    } catch (error) {
      tests.push({ test: "Show Tables", status: "❌ FAIL", error: error.message })
    }

    // Test 3: Check if users table exists
    try {
      const [result] = await connection.execute("DESCRIBE users")
      tests.push({
        test: "Users Table Structure",
        status: "✅ PASS",
        columns: result.map((col) => col.Field),
      })
    } catch (error) {
      tests.push({ test: "Users Table Structure", status: "❌ FAIL", error: error.message })
    }

    await connection.end()

    res.status(200).json({
      message: "Database test completed",
      timestamp: new Date().toISOString(),
      database: {
        host: process.env.DB_HOST || "sql12.freesqldatabase.com",
        database: process.env.DB_NAME || "sql12784318",
      },
      tests,
    })
  } catch (error) {
    res.status(500).json({
      error: "Database test failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
