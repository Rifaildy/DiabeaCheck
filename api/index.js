// Import required modules
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")

// Create Express app
const app = express()

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://diabea-check.vercel.app",
    process.env.FRONTEND_URL,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}

// Middleware
app.use(cors(corsOptions))
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "DiabeaCheck API Server is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: "production",
  })
})

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "ready",
  })
})

// Import and use routes
try {
  const authRoutes = require("../backend/routes/auth")
  const userRoutes = require("../backend/routes/user")
  const predictionRoutes = require("../backend/routes/prediction")
  const healthRoutes = require("../backend/routes/health")
  const feedbackRoutes = require("../backend/routes/feedback")

  app.use("/api/auth", authRoutes)
  app.use("/api/user", userRoutes)
  app.use("/api/prediction", predictionRoutes)
  app.use("/api/health", healthRoutes)
  app.use("/api/feedback", feedbackRoutes)
} catch (error) {
  console.error("Error loading routes:", error)
}

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ["/", "/health", "/api/auth", "/api/user", "/api/prediction", "/api/health", "/api/feedback"],
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("API Error:", error)
  res.status(500).json({
    error: "Internal Server Error",
    message: error.message,
    timestamp: new Date().toISOString(),
  })
})

module.exports = app
