const express = require("express")
const { auth } = require("../middleware/auth")
const logger = require("../utils/logger")

const router = express.Router()

// GET /api/user/dashboard
router.get("/dashboard", auth, async (req, res) => {
  try {
    const user = req.user
    const db = req.db

    // Get user stats
    const statsQuery = `
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

    const stats = await db.query(statsQuery, [user.id])

    // Get recent predictions
    const recentQuery = `
      SELECT * FROM prediction_history 
      WHERE user_id = ? 
      ORDER BY predicted_at DESC 
      LIMIT 5
    `

    const recentPredictions = await db.query(recentQuery, [user.id])

    res.json({
      success: true,
      dashboard: {
        user: user.toJSON(),
        stats: stats[0] || {
          total_predictions: 0,
          avg_probability: 0,
          last_prediction: null,
          high_risk_count: 0,
          moderate_risk_count: 0,
          low_risk_count: 0,
        },
        recentPredictions,
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
router.get("/predictions", auth, async (req, res) => {
  try {
    const user = req.user
    const db = req.db
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    // Get total count
    const countQuery = "SELECT COUNT(*) as total FROM prediction_history WHERE user_id = ?"
    const countResult = await db.query(countQuery, [user.id])
    const total = countResult[0].total

    // Get predictions with pagination - use direct SQL to avoid parameter issues
    const predictionsQuery = `
      SELECT * FROM prediction_history 
      WHERE user_id = ? 
      ORDER BY predicted_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `

    const predictions = await db.query(predictionsQuery, [user.id])

    res.json({
      success: true,
      predictions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

// DELETE /api/user/predictions/:id
router.delete("/predictions/:id", auth, async (req, res) => {
  try {
    const user = req.user
    const db = req.db
    const predictionId = req.params.id

    // Check if prediction belongs to user
    const prediction = await db.findOne("prediction_history", {
      id: predictionId,
      user_id: user.id,
    })

    if (!prediction) {
      return res.status(404).json({
        error: "Prediction not found",
        message: "Prediction not found or does not belong to user",
      })
    }

    // Delete prediction
    await db.delete("prediction_history", { id: predictionId })

    logger.info("Prediction deleted", { userId: user.id, predictionId })

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

module.exports = router
