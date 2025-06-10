const express = require("express")
const { body, validationResult } = require("express-validator")
const MLService = require("../services/mlService")
const PredictionHistory = require("../models/PredictionHistory")
const { auth } = require("../middleware/auth")
const logger = require("../utils/logger")

const router = express.Router()
const mlService = new MLService()

// Validation rules for diabetes prediction
const diabetesPredictionValidation = [
  body("age")
    .isNumeric()
    .withMessage("Age must be a number")
    .isFloat({ min: 1, max: 120 })
    .withMessage("Age must be between 1-120 years"),

  body("glucose")
    .isNumeric()
    .withMessage("Glucose must be a number")
    .isFloat({ min: 0, max: 300 })
    .withMessage("Glucose must be between 0-300 mg/dL"),

  body("bloodPressure")
    .isNumeric()
    .withMessage("Blood pressure must be a number")
    .isFloat({ min: 0, max: 250 })
    .withMessage("Blood pressure must be between 0-250 mmHg"),

  body("bmi")
    .isNumeric()
    .withMessage("BMI must be a number")
    .isFloat({ min: 10, max: 70 })
    .withMessage("BMI must be between 10-70"),

  // Optional fields - only validate if provided
  body("insulin")
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric()
    .withMessage("Insulin must be a number")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Insulin must be between 0-1000 mu U/ml"),

  body("skinThickness")
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric()
    .withMessage("Skin thickness must be a number")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Skin thickness must be between 0-100 mm"),

  body("diabetesPedigreeFunction")
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric()
    .withMessage("Diabetes pedigree function must be a number")
    .isFloat({ min: 0, max: 5 })
    .withMessage("Diabetes pedigree function must be between 0-5"),

  body("pregnancies")
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric()
    .withMessage("Pregnancies must be a number")
    .isFloat({ min: 0, max: 20 })
    .withMessage("Pregnancies must be between 0-20"),
]

// POST /api/prediction/diabetes - Apply auth middleware to get user info
router.post("/diabetes", auth, diabetesPredictionValidation, async (req, res) => {
  try {
    logger.info("Received prediction request:", {
      userId: req.user?.id,
      inputData: req.body,
    })

    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      logger.warn("Validation errors:", errors.array())
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    // Extract and sanitize input data
    const inputData = {
      age: req.body.age,
      glucose: req.body.glucose,
      bloodPressure: req.body.bloodPressure,
      bmi: req.body.bmi,
      insulin: req.body.insulin || 0, // Default to 0 if not provided
      skinThickness: req.body.skinThickness || 0,
      diabetesPedigreeFunction: req.body.diabetesPedigreeFunction || 0,
      pregnancies: req.body.pregnancies || 0,
    }

    logger.info("Sanitized input data:", inputData)

    // Call ML service
    const result = await mlService.predictDiabetes(inputData)
    logger.info("Prediction result:", result)

    // Save prediction to database with authenticated user ID
    try {
      const predictionData = {
        userId: req.user.id, // Use authenticated user ID
        sessionId: req.sessionID || `session_${Date.now()}`,
        age: inputData.age,
        glucose: inputData.glucose,
        bloodPressure: inputData.bloodPressure,
        skinThickness: inputData.skinThickness,
        insulin: inputData.insulin,
        bmi: inputData.bmi,
        diabetesPedigreeFunction: inputData.diabetesPedigreeFunction,
        pregnancies: inputData.pregnancies,
        predictionResult: result.prediction === "Diabetes" ? 1 : 0,
        probability: result.probability,
        confidence: result.confidence,
        riskLevel: result.risk_level,
        modelVersion: result.model_info?.model_type || "MLP Neural Network",
        modelAccuracy: result.model_info?.accuracy || null,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        deviceInfo: {
          platform: req.get("sec-ch-ua-platform"),
          mobile: req.get("sec-ch-ua-mobile"),
        },
        locationData: null,
      }

      logger.info("Saving prediction with user ID:", {
        userId: predictionData.userId,
        userEmail: req.user.email,
      })

      const savedPrediction = await PredictionHistory.create(predictionData)
      logger.info("Prediction saved to database:", {
        id: savedPrediction?.id,
        userId: predictionData.userId,
      })

      // Add database ID to result
      if (savedPrediction?.id) {
        result.predictionId = savedPrediction.id
      }
    } catch (dbError) {
      logger.error("Failed to save prediction to database:", dbError)
      // Continue without failing the request - prediction still works
    }

    // Return successful response
    res.json({
      success: true,
      message: "Prediction completed successfully",
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Prediction error:", error.message)

    // Return error response
    res.status(500).json({
      success: false,
      message: "Prediction failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// GET /api/prediction/health - Health check for ML service
router.get("/health", async (req, res) => {
  try {
    const healthStatus = await mlService.healthCheck()

    res.json({
      success: true,
      message: "Health check completed",
      data: healthStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Health check error:", error.message)

    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// GET /api/prediction/test - Test prediction with sample data
router.get("/test", async (req, res) => {
  try {
    const testResult = await mlService.testPrediction()

    res.json({
      success: true,
      message: "Test prediction completed",
      data: testResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Test prediction error:", error.message)

    res.status(500).json({
      success: false,
      message: "Test prediction failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

module.exports = router
