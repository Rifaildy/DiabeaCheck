const express = require("express")
const { body, validationResult } = require("express-validator")
const { auth } = require("../middleware/auth")
const PredictionHistory = require("../models/PredictionHistory")
const logger = require("../utils/logger")

const router = express.Router()

// All routes require authentication
router.use(auth)

// GET /api/user/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const user = req.user

    // Get user profile
    const profile = await user.getProfile()

    // Get prediction statistics
    const predictionStats = await user.getPredictionStats()

    // Get recent predictions
    const recentPredictions = await user.getPredictionHistory(5, 0)

    // Get trend data for last 30 days
    const trendData = await PredictionHistory.getTrendData(user.id, 30)

    // Get unread notifications count
    const unreadNotifications = await req.db.count("notifications", {
      user_id: user.id,
      is_read: false,
    })

    res.json({
      success: true,
      dashboard: {
        user: user.toJSON(),
        profile,
        stats: predictionStats,
        recentPredictions,
        trendData,
        unreadNotifications,
      },
    })
  } catch (error) {
    logger.error("Dashboard error:", error)
    res.status(500).json({
      error: "Failed to load dashboard",
      message: "Unable to retrieve dashboard data",
    })
  }
})

// GET /api/user/predictions
router.get("/predictions", async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = "predicted_at", sortOrder = "DESC" } = req.query

    const offset = (page - 1) * limit
    const orderBy = `${sortBy} ${sortOrder}`

    const predictions = await PredictionHistory.findByUserId(req.user.id, {
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      orderBy,
    })

    const totalCount = await req.db.count("prediction_history", { user_id: req.user.id })

    res.json({
      success: true,
      predictions: predictions.map((p) => p.toJSON()),
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    logger.error("Get predictions error:", error)
    res.status(500).json({
      error: "Failed to get predictions",
      message: "Unable to retrieve prediction history",
    })
  }
})

// GET /api/user/predictions/:id
router.get("/predictions/:id", async (req, res) => {
  try {
    const predictionId = req.params.id
    const prediction = await PredictionHistory.findById(predictionId)

    if (!prediction) {
      return res.status(404).json({
        error: "Prediction not found",
        message: "Prediction with specified ID does not exist",
      })
    }

    // Check if prediction belongs to current user
    if (prediction.userId !== req.user.id) {
      return res.status(403).json({
        error: "Access denied",
        message: "You don't have permission to view this prediction",
      })
    }

    res.json({
      success: true,
      prediction: prediction.toJSON(),
    })
  } catch (error) {
    logger.error("Get prediction error:", error)
    res.status(500).json({
      error: "Failed to get prediction",
      message: "Unable to retrieve prediction details",
    })
  }
})

// DELETE /api/user/predictions/:id
router.delete("/predictions/:id", async (req, res) => {
  try {
    const predictionId = req.params.id
    const prediction = await PredictionHistory.findById(predictionId)

    if (!prediction) {
      return res.status(404).json({
        error: "Prediction not found",
        message: "Prediction with specified ID does not exist",
      })
    }

    // Check if prediction belongs to current user
    if (prediction.userId !== req.user.id) {
      return res.status(403).json({
        error: "Access denied",
        message: "You don't have permission to delete this prediction",
      })
    }

    await prediction.delete()

    logger.info("Prediction deleted by user", {
      userId: req.user.id,
      predictionId,
    })

    res.json({
      success: true,
      message: "Prediction deleted successfully",
    })
  } catch (error) {
    logger.error("Delete prediction error:", error)
    res.status(500).json({
      error: "Failed to delete prediction",
      message: "Unable to delete prediction",
    })
  }
})

// GET /api/user/health-metrics
router.get("/health-metrics", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const metrics = await req.db.findMany(
      "health_metrics",
      { user_id: req.user.id },
      {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        orderBy: "recorded_at DESC",
      },
    )

    const totalCount = await req.db.count("health_metrics", { user_id: req.user.id })

    res.json({
      success: true,
      metrics,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    logger.error("Get health metrics error:", error)
    res.status(500).json({
      error: "Failed to get health metrics",
      message: "Unable to retrieve health metrics",
    })
  }
})

// POST /api/user/health-metrics
router.post("/health-metrics", async (req, res) => {
  try {
    const {
      systolicBp,
      diastolicBp,
      heartRate,
      temperature,
      oxygenSaturation,
      fastingGlucose,
      randomGlucose,
      hba1c,
      weight,
      height,
      waistCircumference,
      hipCircumference,
      notes,
      symptoms,
      medicationsTaken,
      recordedBy = "user",
      source = "manual",
    } = req.body

    const metricsData = {
      user_id: req.user.id,
      systolic_bp: systolicBp,
      diastolic_bp: diastolicBp,
      heart_rate: heartRate,
      temperature,
      oxygen_saturation: oxygenSaturation,
      fasting_glucose: fastingGlucose,
      random_glucose: randomGlucose,
      hba1c,
      weight,
      height,
      waist_circumference: waistCircumference,
      hip_circumference: hipCircumference,
      notes,
      symptoms: symptoms ? JSON.stringify(symptoms) : null,
      medications_taken: medicationsTaken ? JSON.stringify(medicationsTaken) : null,
      recorded_by: recordedBy,
      source,
      recorded_at: new Date(),
      created_at: new Date(),
    }

    const result = await req.db.insert("health_metrics", metricsData)

    logger.info("Health metrics recorded", {
      userId: req.user.id,
      metricsId: result.insertId,
    })

    res.status(201).json({
      success: true,
      message: "Health metrics recorded successfully",
      metricsId: result.insertId,
    })
  } catch (error) {
    logger.error("Record health metrics error:", error)
    res.status(500).json({
      error: "Failed to record health metrics",
      message: "Unable to save health metrics",
    })
  }
})

// GET /api/user/notifications
router.get("/notifications", async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query
    const offset = (page - 1) * limit

    const conditions = { user_id: req.user.id }
    if (unreadOnly === "true") {
      conditions.is_read = false
    }

    const notifications = await req.db.findMany("notifications", conditions, {
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      orderBy: "created_at DESC",
    })

    const totalCount = await req.db.count("notifications", conditions)

    res.json({
      success: true,
      notifications,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    logger.error("Get notifications error:", error)
    res.status(500).json({
      error: "Failed to get notifications",
      message: "Unable to retrieve notifications",
    })
  }
})

// PUT /api/user/notifications/:id/read
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const notificationId = req.params.id

    // Check if notification belongs to user
    const notification = await req.db.findOne("notifications", {
      id: notificationId,
      user_id: req.user.id,
    })

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
        message: "Notification does not exist or doesn't belong to you",
      })
    }

    await req.db.update(
      "notifications",
      {
        is_read: true,
        read_at: new Date(),
      },
      { id: notificationId },
    )

    res.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    logger.error("Mark notification read error:", error)
    res.status(500).json({
      error: "Failed to mark notification as read",
      message: "Unable to update notification",
    })
  }
})

// PUT /api/user/notifications/read-all
router.put("/notifications/read-all", async (req, res) => {
  try {
    await req.db.update(
      "notifications",
      {
        is_read: true,
        read_at: new Date(),
      },
      {
        user_id: req.user.id,
        is_read: false,
      },
    )

    res.json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    logger.error("Mark all notifications read error:", error)
    res.status(500).json({
      error: "Failed to mark all notifications as read",
      message: "Unable to update notifications",
    })
  }
})

// GET /api/user/stats
router.get("/stats", async (req, res) => {
  try {
    const { period = "30" } = req.query
    const days = Number.parseInt(period)

    // Get prediction statistics
    const predictionStats = await PredictionHistory.getUserStats(req.user.id)

    // Get trend data
    const trendData = await PredictionHistory.getTrendData(req.user.id, days)

    // Get health metrics summary
    const healthMetricsSql = `
      SELECT 
        COUNT(*) as total_records,
        AVG(weight) as avg_weight,
        AVG(systolic_bp) as avg_systolic_bp,
        AVG(diastolic_bp) as avg_diastolic_bp,
        AVG(fasting_glucose) as avg_fasting_glucose,
        MAX(recorded_at) as last_recorded
      FROM health_metrics 
      WHERE user_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `

    const healthMetricsStats = await req.db.query(healthMetricsSql, [req.user.id, days])

    res.json({
      success: true,
      stats: {
        predictions: predictionStats,
        trends: trendData,
        healthMetrics: healthMetricsStats[0],
        period: `${days} days`,
      },
    })
  } catch (error) {
    logger.error("Get user stats error:", error)
    res.status(500).json({
      error: "Failed to get statistics",
      message: "Unable to retrieve user statistics",
    })
  }
})

module.exports = router
