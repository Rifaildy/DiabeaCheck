const express = require("express")
const { body, validationResult } = require("express-validator")
const rateLimit = require("express-rate-limit")
const User = require("../models/User")
const { auth } = require("../middleware/auth")
const logger = require("../utils/logger")

const router = express.Router()

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increased limit for development
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 }) // Reduced minimum for testing
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be between 1 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be between 1 and 50 characters"),
  body("phone").optional().isLength({ min: 10, max: 15 }).withMessage("Phone number must be between 10 and 15 digits"),
  body("dateOfBirth").optional().isISO8601().withMessage("Please provide a valid date of birth"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "laki-laki", "perempuan"])
    .withMessage("Gender must be male, female, or other"),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
]

// POST /api/auth/register
router.post("/register", authLimiter, registerValidation, async (req, res) => {
  try {
    console.log("Registration request received:", req.body)

    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array())
      return res.status(400).json({
        error: "Validation failed",
        message: "Please check your input data",
        details: errors.array(),
      })
    }

    const { email, password, firstName, lastName, phone, dateOfBirth, gender } = req.body

    // Normalize gender
    let normalizedGender = gender
    if (gender === "laki-laki") normalizedGender = "male"
    if (gender === "perempuan") normalizedGender = "female"

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender: normalizedGender,
    })

    // Create session
    const deviceInfo = {
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    }

    const session = await user.createSession(deviceInfo, req.ip, req.get("User-Agent"))

    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
    })

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: user.toJSON(),
      token: session.sessionToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    })
  } catch (error) {
    logger.error("Registration error:", error)

    if (error.message.includes("already exists")) {
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this email address already exists",
      })
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this email address already exists",
      })
    }

    res.status(500).json({
      error: "Registration failed",
      message: error.message || "Unable to create user account",
    })
  }
})

// POST /api/auth/login
router.post("/login", authLimiter, loginValidation, async (req, res) => {
  try {
    console.log("Login request received:", { email: req.body.email })

    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { email, password } = req.body

    // Authenticate user
    const user = await User.authenticate(email, password)

    // Create session
    const deviceInfo = {
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    }

    const session = await user.createSession(deviceInfo, req.ip, req.get("User-Agent"))

    logger.info("User logged in successfully", {
      userId: user.id,
      email: user.email,
    })

    res.json({
      success: true,
      message: "Login successful",
      user: user.toJSON(),
      token: session.sessionToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    })
  } catch (error) {
    logger.error("Login error:", error)

    if (error.message.includes("Invalid email or password")) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid email or password",
      })
    }

    if (error.message.includes("locked")) {
      return res.status(423).json({
        error: "Account locked",
        message: "Account is temporarily locked due to too many failed login attempts",
      })
    }

    res.status(500).json({
      error: "Login failed",
      message: "Unable to process login request",
    })
  }
})

// POST /api/auth/logout
router.post("/logout", auth, async (req, res) => {
  try {
    // Invalidate current session
    const sessionToken = req.token
    await req.db.update("user_sessions", { is_active: false }, { session_token: sessionToken })

    logger.info("User logged out successfully", { userId: req.user.id })

    res.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    logger.error("Logout error:", error)
    res.status(500).json({
      error: "Logout failed",
      message: "Unable to process logout request",
    })
  }
})

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = req.user
    const profile = await user.getProfile()
    const predictionStats = await user.getPredictionStats()

    res.json({
      success: true,
      user: user.toJSON(),
      profile,
      stats: predictionStats,
    })
  } catch (error) {
    logger.error("Get user profile error:", error)
    res.status(500).json({
      error: "Failed to get user profile",
      message: "Unable to retrieve user information",
    })
  }
})

module.exports = router
