const jwt = require("jsonwebtoken")
const User = require("../models/User")
const db = require("../config/database")
const logger = require("../utils/logger")

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided or invalid format",
      })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if session is still active
    const session = await db.findOne("user_sessions", {
      session_token: token,
      is_active: true,
    })

    if (!session || new Date() > new Date(session.expires_at)) {
      return res.status(401).json({
        error: "Token expired",
        message: "Session has expired, please login again",
      })
    }

    // Get user
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "User associated with token not found",
      })
    }

    if (user.status !== "active") {
      return res.status(401).json({
        error: "Account inactive",
        message: "User account is not active",
      })
    }

    // Update last activity
    await db.update("user_sessions", { last_activity: new Date() }, { id: session.id })

    // Attach user and session info to request
    req.user = user
    req.token = token
    req.session = session
    req.db = db

    next()
  } catch (error) {
    logger.error("Authentication error:", error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token is malformed or invalid",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Token has expired, please login again",
      })
    }

    res.status(500).json({
      error: "Authentication failed",
      message: "Unable to authenticate user",
    })
  }
}

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null
      req.db = db
      return next()
    }

    // Use the main auth middleware
    return auth(req, res, next)
  } catch (error) {
    // If auth fails, continue without user
    req.user = null
    req.db = db
    next()
  }
}

module.exports = { auth, optionalAuth }
