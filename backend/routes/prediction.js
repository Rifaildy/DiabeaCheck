const express = require("express")
const router = express.Router()
const MLService = require("../services/mlService")
const { body, validationResult } = require("express-validator")

// Create instance of MLService
const mlService = new MLService()

// Validation middleware for ML API format
const validatePredictionInput = [
  body("age").isInt({ min: 1, max: 120 }).withMessage("Age must be between 1-120"),
  body("bmi").isFloat({ min: 10, max: 100 }).withMessage("BMI must be between 10-100"),
  body("glucose").isFloat({ min: 0, max: 500 }).withMessage("Glucose must be between 0-500"),
  body("insulin").optional().isFloat({ min: 0, max: 1000 }).withMessage("Insulin must be between 0-1000"),
  body("bloodPressure").isFloat({ min: 0, max: 300 }).withMessage("Blood pressure must be between 0-300"),
  // Optional fields for backward compatibility
  body("pregnancies")
    .optional()
    .isInt({ min: 0, max: 20 }),
  body("skinThickness").optional().isFloat({ min: 0, max: 100 }),
  body("diabetesPedigreeFunction").optional().isFloat({ min: 0, max: 5 }),
]

// POST /api/prediction/diabetes
router.post("/diabetes", validatePredictionInput, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const inputData = req.body

    // Make prediction using external ML API
    const prediction = await mlService.predictDiabetes(inputData)

    if (prediction.error) {
      return res.status(503).json({
        success: false,
        message: "ML service unavailable",
        error: prediction.error,
      })
    }

    // Save prediction to database (optional)
    try {
      const db = require("../config/database")
      await db.query(
        `INSERT INTO prediction_history 
         (user_id, input_data, prediction_result, probability, risk_level, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [1, JSON.stringify(inputData), prediction.prediction, prediction.probability, prediction.risk_level],
      )
    } catch (dbError) {
      console.error("Failed to save prediction to database:", dbError)
      // Continue without failing the request
    }

    res.json({
      success: true,
      data: {
        input: inputData,
        prediction: prediction.prediction,
        probability: prediction.probability,
        riskLevel: prediction.risk_level,
        label: prediction.label,
        confidence: prediction.confidence,
        recommendations: prediction.recommendations,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Prediction error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
})

// GET /api/prediction/ml-health
router.get("/ml-health", async (req, res) => {
  try {
    const health = await mlService.healthCheck()
    res.json({
      success: true,
      data: health,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
    })
  }
})

// GET /api/prediction/model-info
router.get("/model-info", async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        modelType: "Multilayer Perceptron (MLP)",
        framework: "TensorFlow/Keras",
        features: ["Age", "BMI", "Glucose", "Insulin", "BloodPressure"],
        apiUrl: process.env.ML_API_URL || "http://localhost:8000",
        version: "1.0.0",
        description: "Diabetes prediction using trained MLP model with external FastAPI service",
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get model info",
      error: error.message,
    })
  }
})

module.exports = router
