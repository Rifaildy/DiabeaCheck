const express = require("express")
const { body, validationResult } = require("express-validator")
const rateLimit = require("express-rate-limit")
const User = require("../models/User")
const auth = require("../middleware/auth")
const logger = require("../utils/logger")

const router = express.Router()

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
})

// Validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  body("firstName").trim().isLength({ min: 2, max: 50 }).withMessage("First name must be between 2 and 50 characters"),
  body("lastName").trim().isLength({ min: 2, max: 50 }).withMessage("Last name must be between 2 and 50 characters"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("dateOfBirth").optional().isISO8601().withMessage("Please provide a valid date of birth"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other"),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
]

const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
]

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
]

// POST /api/auth/register
router.post("/register", authLimiter, registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { email, password, firstName, lastName, phone, dateOfBirth, gender } = req.body

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
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

    res.status(500).json({
      error: "Registration failed",
      message: "Unable to create user account",
    })
  }
})

// POST /api/auth/login
router.post("/login", authLimiter, loginValidation, async (req, res) => {
  try {
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

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token required",
        message: "Refresh token is required for token renewal",
      })
    }

    // Find session with refresh token
    const session = await req.db.findOne("user_sessions", {
      refresh_token: refreshToken,
      is_active: true,
    })

    if (!session || new Date() > new Date(session.expires_at)) {
      return res.status(401).json({
        error: "Invalid refresh token",
        message: "Refresh token is invalid or expired",
      })
    }

    // Get user
    const user = await User.findById(session.user_id)
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "User associated with token not found",
      })
    }

    // Generate new tokens
    const newSession = await user.createSession(
      JSON.parse(session.device_info || "{}"),
      session.ip_address,
      session.user_agent,
    )

    // Invalidate old session
    await req.db.update("user_sessions", { is_active: false }, { id: session.id })

    res.json({
      success: true,
      message: "Token refreshed successfully",
      token: newSession.sessionToken,
      refreshToken: newSession.refreshToken,
      expiresAt: newSession.expiresAt,
    })
  } catch (error) {
    logger.error("Token refresh error:", error)
    res.status(500).json({
      error: "Token refresh failed",
      message: "Unable to refresh token",
    })
  }
})

// POST /api/auth/forgot-password
router.post("/forgot-password", authLimiter, forgotPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { email } = req.body

    const user = await User.findByEmail(email)
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent",
      })
    }

    const resetToken = await user.generatePasswordResetToken()

    // TODO: Send email with reset token
    // For now, we'll just log it (in production, implement email service)
    logger.info("Password reset token generated", {
      userId: user.id,
      email: user.email,
      resetToken, // Remove this in production
    })

    res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent",
      // TODO: Remove this in production
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    })
  } catch (error) {
    logger.error("Forgot password error:", error)
    res.status(500).json({
      error: "Password reset failed",
      message: "Unable to process password reset request",
    })
  }
})

// POST /api/auth/reset-password
router.post("/reset-password", authLimiter, resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { token, password } = req.body

    // Find user with valid reset token
    const user = await req.db.findOne("users", {
      password_reset_token: token,
    })

    if (!user || !user.password_reset_expires || new Date() > new Date(user.password_reset_expires)) {
      return res.status(400).json({
        error: "Invalid or expired token",
        message: "Password reset token is invalid or has expired",
      })
    }

    const userInstance = new User(user)
    await userInstance.updatePassword(password)

    logger.info("Password reset successfully", { userId: user.id })

    res.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    logger.error("Reset password error:", error)
    res.status(500).json({
      error: "Password reset failed",
      message: "Unable to reset password",
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

// PUT /api/auth/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, gender } = req.body

    // Update user basic info
    const user = req.user
    user.firstName = firstName || user.firstName
    user.lastName = lastName || user.lastName
    user.phone = phone || user.phone
    user.dateOfBirth = dateOfBirth || user.dateOfBirth
    user.gender = gender || user.gender

    await user.save()

    // Update profile data
    const { height, weight, bloodType, medicalConditions, medications, allergies } = req.body

    if (height || weight || bloodType || medicalConditions || medications || allergies) {
      await user.updateProfile({
        height,
        weight,
        blood_type: bloodType,
        medical_conditions: medicalConditions ? JSON.stringify(medicalConditions) : null,
        medications: medications ? JSON.stringify(medications) : null,
        allergies: allergies ? JSON.stringify(allergies) : null,
      })
    }

    logger.info("User profile updated", { userId: user.id })

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON(),
    })
  } catch (error) {
    logger.error("Update profile error:", error)
    res.status(500).json({
      error: "Profile update failed",
      message: "Unable to update user profile",
    })
  }
})

// PUT /api/auth/change-password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Current password and new password are required",
      })
    }

    // Verify current password
    const bcrypt = require("bcryptjs")
    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password)

    if (!isValidPassword) {
      return res.status(400).json({
        error: "Invalid current password",
        message: "Current password is incorrect",
      })
    }

    // Update password
    await req.user.updatePassword(newPassword)

    logger.info("Password changed successfully", { userId: req.user.id })

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    logger.error("Change password error:", error)
    res.status(500).json({
      error: "Password change failed",
      message: "Unable to change password",
    })
  }
})

module.exports = router
