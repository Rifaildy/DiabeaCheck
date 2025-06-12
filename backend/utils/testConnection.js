require("dotenv").config()
const mysql = require("mysql2/promise")

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...")
  console.log("Host:", process.env.DB_HOST)
  console.log("Port:", process.env.DB_PORT)
  console.log("User:", process.env.DB_USER)
  console.log("Database:", process.env.DB_NAME)

  const config = {
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Removed SSL configuration since server doesn't support it
    connectTimeout: 60000,
  }

  try {
    console.log("🔄 Attempting to connect without SSL...")
    const connection = await mysql.createConnection(config)

    console.log("✅ Connection successful!")

    // Test a simple query
    const [rows] = await connection.execute("SELECT 1 as test")
    console.log("✅ Query test successful:", rows)

    // Show database info
    const [dbInfo] = await connection.execute("SELECT DATABASE() as current_db, VERSION() as version")
    console.log("📊 Database info:", dbInfo[0])

    // List tables
    const [tables] = await connection.execute("SHOW TABLES")
    console.log("📋 Existing tables:", tables)

    await connection.end()
    console.log("✅ Connection test completed successfully!")
  } catch (error) {
    console.error("❌ Connection failed:")
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)
    console.error("Error errno:", error.errno)

    if (error.code === "ECONNREFUSED") {
      console.log("\n🔧 Troubleshooting tips:")
      console.log("1. Check if the host and port are correct")
      console.log("2. Verify your internet connection")
      console.log("3. Check if the database server allows external connections")
      console.log("4. Verify firewall settings")
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n🔧 Authentication issue:")
      console.log("1. Check username and password")
      console.log("2. Verify user has permission to access the database")
    } else if (error.code === "HANDSHAKE_NO_SSL_SUPPORT") {
      console.log("\n🔧 SSL not supported:")
      console.log("1. The database server doesn't support SSL connections")
      console.log("2. Connecting without SSL (this is normal for many free database providers)")
    }
  }
}

testDatabaseConnection()
