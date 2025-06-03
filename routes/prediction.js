const express = require("express")
const { body, validationResult } = require("express-validator")
const PredictionService = require("../services/predictionService")
const PredictionHistory = require("../models/PredictionHistory")
const { optionalAuth } = require("../middleware/auth")
const logger = require("../utils/logger")

const router = express.Router()

// Validation rules for prediction input
const predictionValidation = [
  body("age").isFloat({ min: 1, max: 120 }).withMessage("Age must be between 1 and 120"),
  body("glucose").isFloat({ min: 0, max: 300 }).withMessage("Glucose level must be between 0 and 300 mg/dL"),
  body("bloodPressure").isFloat({ min: 0, max: 250 }).withMessage("Blood pressure must be between 0 and 250 mmHg"),
  body("skinThickness")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Skin thickness must be between 0 and 100 mm"),
  body("insulin")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Insulin level must be between 0 and 1000 mu U/ml"),
  body("bmi").isFloat({ min: 10, max: 70 }).withMessage("BMI must be between 10 and 70"),
  body("diabetesPedigreeFunction")
    .optional()
    .isFloat({ min: 0, max: 2.5 })
    .withMessage("Diabetes pedigree function must be between 0.0 and 2.5"),
  body("pregnancies")
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage("Number of pregnancies must be between 0 and 20"),
]

// POST /api/predict
router.post("/", optionalAuth, predictionValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const inputData = req.body

    // Log prediction request (without sensitive data)
    logger.info("Prediction request received", {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id || null,
      hasUser: !!req.user,
    })

    // Get prediction from ML service
    const result = await PredictionService.predict(inputData)

    // Prepare data for database storage
    const predictionData = {
      userId: req.user?.id || null,
      sessionId: req.user ? null : req.sessionID || `anon_${Date.now()}`,
      age: inputData.age,
      glucose: inputData.glucose,
      bloodPressure: inputData.bloodPressure,
      skinThickness: inputData.skinThickness,
      insulin: inputData.insulin,
      bmi: inputData.bmi,
      diabetesPedigreeFunction: inputData.diabetesPedigreeFunction,
      pregnancies: inputData.pregnancies,
      predictionResult: result.prediction,
      probability: result.probability,
      confidence: result.confidence,
      riskLevel: result.riskLevel,
      modelVersion: "1.0.0",
      modelAccuracy: 0.85,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      deviceInfo: {
        userAgent: req.get("User-Agent"),
        acceptLanguage: req.get("Accept-Language"),
        acceptEncoding: req.get("Accept-Encoding"),
      },
    }

    // Save prediction to database
    const savedPrediction = await PredictionHistory.create(predictionData)

    // Log successful prediction
    logger.info("Prediction completed successfully", {
      timestamp: new Date().toISOString(),
      predictionId: savedPrediction.id,
      userId: req.user?.id || null,
      prediction: result.prediction,
      probability: result.probability,
      riskLevel: result.riskLevel,
    })

    // Create notification for registered users with high risk
    if (req.user && result.riskLevel === "High") {
      try {
        await req.db.insert("notifications", {
          user_id: req.user.id,
          type: "prediction_reminder",
          title: "Risiko Diabetes Tinggi Terdeteksi",
          message:
            "Hasil prediksi menunjukkan risiko diabetes tinggi. Disarankan untuk segera berkonsultasi dengan dokter.",
          data: JSON.stringify({
            predictionId: savedPrediction.id,
            probability: result.probability,
            riskLevel: result.riskLevel,
          }),
          priority: "high",
          created_at: new Date(),
        })
      } catch (notificationError) {
        logger.error("Failed to create notification:", notificationError)
        // Don't fail the prediction if notification creation fails
      }
    }

    res.json({
      success: true,
      predictionId: savedPrediction.id,
      prediction: result.prediction,
      probability: result.probability,
      confidence: result.confidence,
      riskLevel: result.riskLevel,
      riskLevelIndonesian: savedPrediction.getRiskLevelIndonesian(),
      message: result.message,
      timestamp: new Date().toISOString(),
      recommendations: result.recommendations,
      inputData: savedPrediction.getInputSummary(),
    })
  } catch (error) {
    logger.error("Prediction error:", error)

    res.status(500).json({
      error: "Prediction failed",
      message: "Unable to process prediction request. Please try again later.",
      timestamp: new Date().toISOString(),
    })
  }
})

// GET /api/predict/model-info
router.get("/model-info", (req, res) => {
  res.json({
    modelName: "Random Forest Classifier",
    version: "1.0.0",
    accuracy: 0.85,
    precision: 0.82,
    recall: 0.78,
    f1Score: 0.8,
    features: [
      {
        name: "age",
        description: "Age in years",
        type: "numeric",
        range: "1-120",
        required: true,
      },
      {
        name: "glucose",
        description: "Plasma glucose concentration",
        type: "numeric",
        range: "0-300 mg/dL",
        required: true,
      },
      {
        name: "bloodPressure",
        description: "Diastolic blood pressure",
        type: "numeric",
        range: "0-250 mmHg",
        required: true,
      },
      {
        name: "skinThickness",
        description: "Triceps skin fold thickness",
        type: "numeric",
        range: "0-100 mm",
        required: false,
      },
      {
        name: "insulin",
        description: "2-Hour serum insulin",
        type: "numeric",
        range: "0-1000 mu U/ml",
        required: false,
      },
      {
        name: "bmi",
        description: "Body mass index",
        type: "numeric",
        range: "10-70",
        required: true,
      },
      {
        name: "diabetesPedigreeFunction",
        description: "Diabetes pedigree function",
        type: "numeric",
        range: "0.0-2.5",
        required: false,
      },
      {
        name: "pregnancies",
        description: "Number of times pregnant",
        type: "integer",
        range: "0-20",
        required: false,
      },
    ],
    trainingDataset: "NHANES + Pima Indians Diabetes Dataset",
    lastUpdated: "2024-12-01",
    team: "CC25-CF186 ML Team",
    performance: {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.78,
      f1Score: 0.8,
      auc: 0.87,
    },
  })
})

// GET /api/predict/stats (global statistics)
router.get("/stats", async (req, res) => {
  try {
    const globalStats = await PredictionHistory.getGlobalStats()
    const recentPredictions = await PredictionHistory.getRecentPredictions(5)

    res.json({
      success: true,
      stats: {
        global: globalStats,
        recent: recentPredictions.map((p) => ({
          id: p.id,
          riskLevel: p.risk_level,
          probability: p.probability,
          predictedAt: p.predicted_at,
          userEmail: p.email ? p.email.substring(0, 3) + "***" : "Anonymous",
        })),
      },
    })
  } catch (error) {
    logger.error("Get prediction stats error:", error)
    res.status(500).json({
      error: "Failed to get statistics",
      message: "Unable to retrieve prediction statistics",
    })
  }
})

// POST /api/predict/batch (for future batch predictions)
router.post("/batch", optionalAuth, async (req, res) => {
  try {
    const { predictions } = req.body

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return res.status(400).json({
        error: "Invalid input",
        message: "Predictions array is required and must not be empty",
      })
    }

    if (predictions.length > 10) {
      return res.status(400).json({
        error: "Batch size exceeded",
        message: "Maximum 10 predictions per batch request",
      })
    }

    const results = await Promise.all(
      predictions.map(async (data, index) => {
        try {
          // Validate each prediction data
          const validation = validationResult({ body: data })
          if (!validation.isEmpty()) {
            return {
              index,
              success: false,
              error: "Validation failed",
              details: validation.array(),
            }
          }

          const result = await PredictionService.predict(data)

          // Save to database
          const predictionData = {
            userId: req.user?.id || null,
            sessionId: req.user ? null : `batch_${Date.now()}_${index}`,
            ...data,
            predictionResult: result.prediction,
            probability: result.probability,
            confidence: result.confidence,
            riskLevel: result.riskLevel,
            modelVersion: "1.0.0",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          }

          const savedPrediction = await PredictionHistory.create(predictionData)

          return {
            index,
            success: true,
            predictionId: savedPrediction.id,
            ...result,
          }
        } catch (error) {
          logger.error(`Batch prediction error for index ${index}:`, error)
          return {
            index,
            success: false,
            error: error.message,
          }
        }
      }),
    )

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    logger.info("Batch prediction completed", {
      userId: req.user?.id || null,
      totalRequests: results.length,
      successCount,
      failureCount,
    })

    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Batch prediction error:", error)
    res.status(500).json({
      error: "Batch prediction failed",
      message: "Unable to process batch prediction request",
    })
  }
})

module.exports = router
