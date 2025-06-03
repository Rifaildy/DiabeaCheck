const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const db = require("../config/database")
const logger = require("../utils/logger")

class User {
  constructor(data = {}) {
    this.id = data.id
    this.email = data.email
    this.password = data.password
    this.firstName = data.first_name || data.firstName
    this.lastName = data.last_name || data.lastName
    this.phone = data.phone
    this.dateOfBirth = data.date_of_birth || data.dateOfBirth
    this.gender = data.gender
    this.profilePicture = data.profile_picture || data.profilePicture
    this.emailVerified = data.email_verified || data.emailVerified
    this.status = data.status
    this.lastLogin = data.last_login || data.lastLogin
    this.createdAt = data.created_at || data.createdAt
    this.updatedAt = data.updated_at || data.updatedAt
  }

  // Static methods for user operations
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

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex")

      const userData_db = {
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone,
        date_of_birth: dateOfBirth,
        gender,
        email_verification_token: emailVerificationToken,
        created_at: new Date(),
      }

      const result = await db.insert("users", userData_db)

      logger.info("User created successfully", { userId: result.insertId, email })

      return new User({ id: result.insertId, ...userData_db })
    } catch (error) {
      logger.error("Error creating user:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const userData = await db.findById("users", id)
      return userData ? new User(userData) : null
    } catch (error) {
      logger.error("Error finding user by ID:", error)
      throw error
    }
  }

  static async findByEmail(email) {
    try {
      const userData = await db.findOne("users", { email })
      return userData ? new User(userData) : null
    } catch (error) {
      logger.error("Error finding user by email:", error)
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
      if (user.isLocked()) {
        throw new Error("Account is temporarily locked due to too many failed login attempts")
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        await user.incrementLoginAttempts()
        throw new Error("Invalid email or password")
      }

      // Reset login attempts and update last login
      await user.resetLoginAttempts()
      await user.updateLastLogin()

      logger.info("User authenticated successfully", { userId: user.id, email })

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
      if (this.id) {
        // Update existing user
        const updateData = {
          email: this.email,
          first_name: this.firstName,
          last_name: this.lastName,
          phone: this.phone,
          date_of_birth: this.dateOfBirth,
          gender: this.gender,
          profile_picture: this.profilePicture,
          email_verified: this.emailVerified,
          status: this.status,
          updated_at: new Date(),
        }

        await db.update("users", updateData, { id: this.id })
        this.updatedAt = updateData.updated_at
      } else {
        // Create new user (this should use User.create instead)
        throw new Error("Use User.create() for creating new users")
      }

      return this
    } catch (error) {
      logger.error("Error saving user:", error)
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
          updated_at: new Date(),
        },
        { id: this.id },
      )

      this.password = hashedPassword
      logger.info("Password updated successfully", { userId: this.id })
    } catch (error) {
      logger.error("Error updating password:", error)
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
      const loginAttempts = (this.loginAttempts || 0) + 1
      const updateData = {
        login_attempts: loginAttempts,
        updated_at: new Date(),
      }

      // Lock account after 5 failed attempts for 30 minutes
      if (loginAttempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000)
      }

      await db.update("users", updateData, { id: this.id })
    } catch (error) {
      logger.error("Error incrementing login attempts:", error)
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

  async createSession(deviceInfo = {}, ipAddress = "", userAgent = "") {
    try {
      const sessionToken = this.generateJWT()
      const refreshToken = this.generateRefreshToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      const sessionData = {
        user_id: this.id,
        session_token: sessionToken,
        refresh_token: refreshToken,
        device_info: JSON.stringify(deviceInfo),
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt,
        created_at: new Date(),
      }

      await db.insert("user_sessions", sessionData)

      return {
        sessionToken,
        refreshToken,
        expiresAt,
      }
    } catch (error) {
      logger.error("Error creating session:", error)
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
      const sql = `
        SELECT 
          COUNT(*) as total_predictions,
          AVG(probability) as avg_probability,
          MAX(predicted_at) as last_prediction,
          SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risk_count,
          SUM(CASE WHEN risk_level = 'Moderate' THEN 1 ELSE 0 END) as moderate_risk_count,
          SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) as low_risk_count
        FROM prediction_history 
        WHERE user_id = ?
      `
      const result = await db.query(sql, [this.id])
      return result[0]
    } catch (error) {
      logger.error("Error getting prediction stats:", error)
      throw error
    }
  }

  async getProfile() {
    try {
      const profile = await db.findOne("user_profiles", { user_id: this.id })
      return profile
    } catch (error) {
      logger.error("Error getting user profile:", error)
      throw error
    }
  }

  async updateProfile(profileData) {
    try {
      const existingProfile = await this.getProfile()

      if (existingProfile) {
        await db.update("user_profiles", { ...profileData, updated_at: new Date() }, { user_id: this.id })
      } else {
        await db.insert("user_profiles", { user_id: this.id, ...profileData, created_at: new Date() })
      }

      logger.info("User profile updated", { userId: this.id })
    } catch (error) {
      logger.error("Error updating user profile:", error)
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
