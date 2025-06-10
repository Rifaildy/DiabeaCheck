const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const db = require("../config/database")
const logger = require("../utils/logger")

class User {
  constructor(userData) {
    this.id = userData.id
    this.email = userData.email
    this.password = userData.password
    this.firstName = userData.first_name
    this.lastName = userData.last_name
    this.phone = userData.phone
    this.dateOfBirth = userData.date_of_birth
    this.gender = userData.gender
    this.profilePicture = userData.profile_picture
    this.emailVerified = userData.email_verified
    this.status = userData.status
    this.loginAttempts = userData.login_attempts
    this.lockedUntil = userData.locked_until
    this.lastLogin = userData.last_login
    this.createdAt = userData.created_at
    this.updatedAt = userData.updated_at
  }

  // Static methods
  static async create(userData) {
    try {
      const { email, password, firstName, lastName, phone, dateOfBirth, gender } = userData

      // Check if user already exists
      const existingUser = await db.findOne("users", { email })
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Hash password
      const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Insert user
      const result = await db.insert("users", {
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        email_verified: false,
        status: "active",
      })

      // Get created user
      const newUser = await db.findById("users", result.insertId)
      if (!newUser) {
        throw new Error("Failed to create user")
      }

      // Create user profile
      await db.insert("user_profiles", {
        user_id: result.insertId,
      })

      logger.info("User created successfully", { userId: result.insertId, email })

      return new User(newUser)
    } catch (error) {
      logger.error("User creation error:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const userData = await db.findById("users", id)
      return userData ? new User(userData) : null
    } catch (error) {
      logger.error("Find user by ID error:", error)
      throw error
    }
  }

  static async findByEmail(email) {
    try {
      const userData = await db.findOne("users", { email })
      return userData ? new User(userData) : null
    } catch (error) {
      logger.error("Find user by email error:", error)
      throw error
    }
  }

  static async authenticate(email, password) {
    try {
      const user = await User.findByEmail(email)
      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Check if account is locked
      if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
        throw new Error("Account is temporarily locked")
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        // Increment login attempts
        await user.incrementLoginAttempts()
        throw new Error("Invalid email or password")
      }

      // Reset login attempts and update last login
      await db.update(
        "users",
        {
          login_attempts: 0,
          locked_until: null,
          last_login: new Date(),
        },
        { id: user.id },
      )

      return user
    } catch (error) {
      logger.error("Authentication error:", error)
      throw error
    }
  }

  static async findMany(conditions = {}, options = {}) {
    try {
      const users = await db.findMany("users", conditions, options)
      return users.map((userData) => new User(userData))
    } catch (error) {
      logger.error("Error finding users:", error)
      throw error
    }
  }

  // Instance methods
  async save() {
    try {
      await db.update(
        "users",
        {
          email: this.email,
          first_name: this.firstName,
          last_name: this.lastName,
          phone: this.phone,
          date_of_birth: this.dateOfBirth,
          gender: this.gender,
          profile_picture: this.profilePicture,
        },
        { id: this.id },
      )

      logger.info("User updated successfully", { userId: this.id })
    } catch (error) {
      logger.error("User save error:", error)
      throw error
    }
  }

  async updatePassword(newPassword) {
    try {
      const saltRounds = Number.parseInt(process.env.BCRYPT_ROUNDS) || 12
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

      await db.update(
        "users",
        {
          password: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
        },
        { id: this.id },
      )

      this.password = hashedPassword
      logger.info("Password updated successfully", { userId: this.id })
    } catch (error) {
      logger.error("Password update error:", error)
      throw error
    }
  }

  async generatePasswordResetToken() {
    try {
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetExpires = new Date(Date.now() + 3600000) // 1 hour

      await db.update(
        "users",
        {
          password_reset_token: resetToken,
          password_reset_expires: resetExpires,
          updated_at: new Date(),
        },
        { id: this.id },
      )

      return resetToken
    } catch (error) {
      logger.error("Error generating password reset token:", error)
      throw error
    }
  }

  async verifyEmail() {
    try {
      await db.update(
        "users",
        {
          email_verified: true,
          email_verification_token: null,
          updated_at: new Date(),
        },
        { id: this.id },
      )

      this.emailVerified = true
      logger.info("Email verified successfully", { userId: this.id })
    } catch (error) {
      logger.error("Error verifying email:", error)
      throw error
    }
  }

  async incrementLoginAttempts() {
    try {
      const maxAttempts = 5
      const lockTime = 30 * 60 * 1000 // 30 minutes

      const newAttempts = this.loginAttempts + 1
      const updateData = { login_attempts: newAttempts }

      if (newAttempts >= maxAttempts) {
        updateData.locked_until = new Date(Date.now() + lockTime)
      }

      await db.update("users", updateData, { id: this.id })
    } catch (error) {
      logger.error("Increment login attempts error:", error)
      throw error
    }
  }

  async resetLoginAttempts() {
    try {
      await db.update(
        "users",
        {
          login_attempts: 0,
          locked_until: null,
          updated_at: new Date(),
        },
        { id: this.id },
      )
    } catch (error) {
      logger.error("Error resetting login attempts:", error)
      throw error
    }
  }

  async updateLastLogin() {
    try {
      const now = new Date()
      await db.update("users", { last_login: now, updated_at: now }, { id: this.id })
      this.lastLogin = now
    } catch (error) {
      logger.error("Error updating last login:", error)
      throw error
    }
  }

  isLocked() {
    return this.lockedUntil && new Date() < new Date(this.lockedUntil)
  }

  generateJWT() {
    const payload = {
      userId: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    })
  }

  generateRefreshToken() {
    return crypto.randomBytes(40).toString("hex")
  }

  async createSession(deviceInfo, ipAddress, userAgent) {
    try {
      const token = jwt.sign({ userId: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
      })

      const refreshToken = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await db.insert("user_sessions", {
        user_id: this.id,
        session_token: token,
        refresh_token: refreshToken,
        device_info: JSON.stringify(deviceInfo),
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt,
        is_active: true,
      })

      return {
        sessionToken: token,
        refreshToken,
        expiresAt,
      }
    } catch (error) {
      logger.error("Session creation error:", error)
      throw error
    }
  }

  async getPredictionHistory(limit = 10, offset = 0) {
    try {
      const sql = `
        SELECT * FROM prediction_history 
        WHERE user_id = ? 
        ORDER BY predicted_at DESC 
        LIMIT ? OFFSET ?
      `
      return await db.query(sql, [this.id, limit, offset])
    } catch (error) {
      logger.error("Error getting prediction history:", error)
      throw error
    }
  }

  async getPredictionStats() {
    try {
      const stats = await db.query(
        `
        SELECT 
          COUNT(*) as total_predictions,
          SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risk_count,
          SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) as low_risk_count,
          AVG(probability) as avg_probability
        FROM prediction_history 
        WHERE user_id = ?
      `,
        [this.id],
      )

      return (
        stats[0] || {
          total_predictions: 0,
          high_risk_count: 0,
          low_risk_count: 0,
          avg_probability: 0,
        }
      )
    } catch (error) {
      logger.error("Get prediction stats error:", error)
      throw error
    }
  }

  async getProfile() {
    try {
      const profile = await db.findOne("user_profiles", { user_id: this.id })
      return profile
    } catch (error) {
      logger.error("Get profile error:", error)
      throw error
    }
  }

  async updateProfile(profileData) {
    try {
      await db.update("user_profiles", profileData, { user_id: this.id })
      logger.info("Profile updated successfully", { userId: this.id })
    } catch (error) {
      logger.error("Profile update error:", error)
      throw error
    }
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      profilePicture: this.profilePicture,
      emailVerified: this.emailVerified,
      status: this.status,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

module.exports = User
