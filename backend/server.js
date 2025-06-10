require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")

const db = require("./config/database")
const logger = require("./utils/logger")
const errorHandler = require("./middleware/errorHandler")

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const predictionRoutes = require("./routes/prediction")
const healthRoutes = require("./routes/health")
const feedbackRoutes = require("./routes/feedback")

const app = express()
const PORT = process.env.PORT || 5000

// Trust proxy for rate limiting
app.set("trust proxy", 1)

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:3001", "http://127.0.0.1:3001", process.env.FRONTEND_URL || "http://localhost:3001"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}

// Middleware
app.use(cors(corsOptions))
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for development
  }),
)
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/api", limiter)

// Connect to database
db.connect().catch((error) => {
  logger.error("Failed to connect to database:", error)
  process.exit(1)
})

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "DiabeaCheck API Server is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await db.query("SELECT 1")

    res.json({
      status: "OK",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
    })
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "Server is unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
      database: "disconnected",
    })
  }
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/prediction", predictionRoutes)
app.use("/api/health", healthRoutes)
app.use("/api/feedback", feedbackRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 DiabeaCheck API Server running on port ${PORT}`)
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`)
  logger.info(`💾 Database: MySQL`)
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully")
  await db.disconnect()
  process.exit(0)
})

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully")
  await db.disconnect()
  process.exit(0)
})

module.exports = app
