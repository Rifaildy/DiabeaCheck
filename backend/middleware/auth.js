const jwt = require("jsonwebtoken")
const User = require("../models/User")
const db = require("../config/database")
const logger = require("../utils/logger")

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied",
        message: "No valid token provided",
      })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        error: "Access denied",
        message: "User not found",
      })
    }

    // Check if session is still active
    const session = await db.findOne("user_sessions", {
      session_token: token,
      is_active: true,
      user_id: user.id,
    })

    if (!session || new Date() > new Date(session.expires_at)) {
      return res.status(401).json({
        error: "Session expired",
        message: "Please login again",
      })
    }

    // Add user and token to request
    req.user = user
    req.token = token
    req.db = db

    next()
  } catch (error) {
    logger.error("Auth middleware error:", error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token is malformed",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Please login again",
      })
    }

    res.status(500).json({
      error: "Authentication failed",
      message: "Unable to authenticate user",
    })
  }
}

module.exports = { auth }
