const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
require("dotenv").config()

// Import database
const db = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const predictionRoutes = require("./routes/prediction")
const healthRoutes = require("./routes/health")
const feedbackRoutes = require("./routes/feedback")

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const logger = require("./utils/logger")

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
})
app.use("/api/", limiter)

// Prediction specific rate limiting
const predictionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 prediction requests per minute
  message: {
    error: "Too many prediction requests, please try again later.",
  },
})

// Middleware
app.use(compression())
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Connect to database
db.connect().catch((error) => {
  logger.error("Failed to connect to database:", error)
  process.exit(1)
})

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await db.query("SELECT 1")

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: "connected",
      version: "1.0.0",
    })
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message,
    })
  }
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/predict", predictionLimiter, predictionRoutes)
app.use("/api/health", healthRoutes)
app.use("/api/feedback", feedbackRoutes)

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "DiabeaCheck API Server",
    version: "1.0.0",
    team: "CC25-CF186",
    endpoints: {
      health: "/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        profile: "GET /api/auth/me",
        forgotPassword: "POST /api/auth/forgot-password",
        resetPassword: "POST /api/auth/reset-password",
      },
      user: {
        dashboard: "GET /api/user/dashboard",
        predictions: "GET /api/user/predictions",
        healthMetrics: "GET /api/user/health-metrics",
        notifications: "GET /api/user/notifications",
        stats: "GET /api/user/stats",
      },
      prediction: "POST /api/predict",
      healthTips: "GET /api/health/tips",
      feedback: "POST /api/feedback",
    },
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

// Error handling middleware
app.use(errorHandler)

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

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 DiabeaCheck API Server running on port ${PORT}`)
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`)
  logger.info(`💾 Database: MySQL`)
})

module.exports = app
