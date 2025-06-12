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

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "DiabeaCheck API Server is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: "production",
    availableEndpoints: [
      "/health",
      "/auth/register",
      "/auth/login",
      "/user/profile",
      "/prediction/predict",
      "/health/tips",
      "/feedback",
    ],
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "ready",
    version: "1.0.0",
  })
})

// Import and use routes with error handling
try {
  // Auth routes
  app.post("/auth/register", (req, res) => {
    res.json({ message: "Register endpoint working", data: req.body })
  })

  app.post("/auth/login", (req, res) => {
    res.json({ message: "Login endpoint working", data: req.body })
  })

  // User routes
  app.get("/user/profile", (req, res) => {
    res.json({ message: "Profile endpoint working" })
  })

  // Prediction routes
  app.post("/prediction/predict", (req, res) => {
    res.json({ message: "Prediction endpoint working", data: req.body })
  })

  // Health tips routes
  app.get("/health/tips", (req, res) => {
    const healthTips = [
      {
        id: 1,
        category: "nutrition",
        title: "Pola Makan Sehat",
        description: "Konsumsi makanan bergizi seimbang dengan porsi yang tepat",
        icon: "🥗",
      },
      {
        id: 2,
        category: "exercise",
        title: "Olahraga Teratur",
        description: "Lakukan aktivitas fisik minimal 30 menit setiap hari",
        icon: "🏃‍♂️",
      },
    ]

    res.json({
      success: true,
      tips: healthTips,
      total: healthTips.length,
    })
  })

  // Feedback routes
  app.post("/feedback", (req, res) => {
    res.json({ message: "Feedback endpoint working", data: req.body })
  })
} catch (error) {
  console.error("Error setting up routes:", error)
}

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "/",
      "/health",
      "/auth/register",
      "/auth/login",
      "/user/profile",
      "/prediction/predict",
      "/health/tips",
      "/feedback",
    ],
    timestamp: new Date().toISOString(),
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
