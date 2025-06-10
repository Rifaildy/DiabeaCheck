const db = require("../config/database")
const logger = require("../utils/logger")

class PredictionHistory {
  constructor(data = {}) {
    this.id = data.id
    this.userId = data.user_id || data.userId
    this.sessionId = data.session_id || data.sessionId
    this.age = data.age
    this.glucose = data.glucose
    this.bloodPressure = data.blood_pressure || data.bloodPressure
    this.skinThickness = data.skin_thickness || data.skinThickness
    this.insulin = data.insulin
    this.bmi = data.bmi
    this.diabetesPedigreeFunction = data.diabetes_pedigree_function || data.diabetesPedigreeFunction
    this.pregnancies = data.pregnancies
    this.predictionResult = data.prediction_result || data.predictionResult
    this.probability = data.probability
    this.confidence = data.confidence
    this.riskLevel = data.risk_level || data.riskLevel
    this.modelVersion = data.model_version || data.modelVersion
    this.modelAccuracy = data.model_accuracy || data.modelAccuracy
    this.ipAddress = data.ip_address || data.ipAddress
    this.userAgent = data.user_agent || data.userAgent
    this.deviceInfo = data.device_info || data.deviceInfo
    this.locationData = data.location_data || data.locationData
    this.predictedAt = data.predicted_at || data.predictedAt
    this.createdAt = data.created_at || data.createdAt
    this.updatedAt = data.updated_at || data.updatedAt
  }

  static async create(predictionData) {
    try {
      const {
        userId,
        sessionId,
        age,
        glucose,
        bloodPressure,
        skinThickness,
        insulin,
        bmi,
        diabetesPedigreeFunction,
        pregnancies,
        predictionResult,
        probability,
        confidence,
        riskLevel,
        modelVersion,
        modelAccuracy,
        ipAddress,
        userAgent,
        deviceInfo,
        locationData,
      } = predictionData

      const dbData = {
        user_id: userId,
        session_id: sessionId,
        age: Number.parseInt(age),
        glucose: Number.parseFloat(glucose),
        blood_pressure: Number.parseFloat(bloodPressure),
        skin_thickness: skinThickness ? Number.parseFloat(skinThickness) : null,
        insulin: insulin ? Number.parseFloat(insulin) : null,
        bmi: Number.parseFloat(bmi),
        diabetes_pedigree_function: diabetesPedigreeFunction ? Number.parseFloat(diabetesPedigreeFunction) : null,
        pregnancies: pregnancies ? Number.parseInt(pregnancies) : 0,
        prediction_result: Number.parseInt(predictionResult),
        probability: Number.parseFloat(probability),
        confidence: confidence ? Number.parseFloat(confidence) : null,
        risk_level: riskLevel,
        model_version: modelVersion || "MLP Neural Network",
        model_accuracy: modelAccuracy ? Number.parseFloat(modelAccuracy) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
        location_data: locationData ? JSON.stringify(locationData) : null,
        predicted_at: new Date(),
        created_at: new Date(),
      }

      logger.info("Creating prediction history with data:", dbData)

      const result = await db.insert("prediction_history", dbData)

      logger.info("Prediction history created successfully", {
        predictionId: result.insertId,
        userId,
        riskLevel,
        probability,
      })

      return new PredictionHistory({ id: result.insertId, ...dbData })
    } catch (error) {
      logger.error("Error creating prediction history:", error)
      throw error
    }
  }

  static async findById(id) {
    try {
      const data = await db.findById("prediction_history", id)
      return data ? new PredictionHistory(data) : null
    } catch (error) {
      logger.error("Error finding prediction by ID:", error)
      throw error
    }
  }

  static async findByUserId(userId, options = {}) {
    try {
      const { limit = 10, offset = 0, orderBy = "predicted_at DESC" } = options

      const sql = `
        SELECT * FROM prediction_history 
        WHERE user_id = ? 
        ORDER BY predicted_at DESC 
        LIMIT ? OFFSET ?
      `

      const predictions = await db.query(sql, [userId, Number.parseInt(limit), Number.parseInt(offset)])
      return predictions.map((data) => new PredictionHistory(data))
    } catch (error) {
      logger.error("Error finding predictions by user ID:", error)
      throw error
    }
  }

  static async findBySessionId(sessionId) {
    try {
      const predictions = await db.findMany("prediction_history", { session_id: sessionId })
      return predictions.map((data) => new PredictionHistory(data))
    } catch (error) {
      logger.error("Error finding predictions by session ID:", error)
      throw error
    }
  }

  static async getRecentPredictions(limit = 10) {
    try {
      const sql = `
        SELECT 
          ph.*,
          u.email,
          u.first_name,
          u.last_name
        FROM prediction_history ph
        LEFT JOIN users u ON ph.user_id = u.id
        ORDER BY ph.predicted_at DESC
        LIMIT ?
      `

      const predictions = await db.query(sql, [Number.parseInt(limit)])
      return predictions.map((data) => new PredictionHistory(data))
    } catch (error) {
      logger.error("Error getting recent predictions:", error)
      throw error
    }
  }

  static async getUserStats(userId) {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_predictions,
          AVG(probability) as avg_probability,
          MIN(probability) as min_probability,
          MAX(probability) as max_probability,
          MAX(predicted_at) as last_prediction,
          MIN(predicted_at) as first_prediction,
          SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risk_count,
          SUM(CASE WHEN risk_level = 'Moderate' THEN 1 ELSE 0 END) as moderate_risk_count,
          SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) as low_risk_count,
          SUM(CASE WHEN prediction_result = 1 THEN 1 ELSE 0 END) as positive_predictions,
          SUM(CASE WHEN prediction_result = 0 THEN 1 ELSE 0 END) as negative_predictions
        FROM prediction_history 
        WHERE user_id = ?
      `

      const result = await db.query(sql, [userId])
      return result[0]
    } catch (error) {
      logger.error("Error getting user prediction stats:", error)
      throw error
    }
  }

  static async getGlobalStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_predictions,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(probability) as avg_probability,
          SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risk_count,
          SUM(CASE WHEN risk_level = 'Moderate' THEN 1 ELSE 0 END) as moderate_risk_count,
          SUM(CASE WHEN risk_level = 'Low' THEN 1 ELSE 0 END) as low_risk_count,
          DATE(MAX(predicted_at)) as last_prediction_date
        FROM prediction_history
      `

      const result = await db.query(sql)
      return result[0]
    } catch (error) {
      logger.error("Error getting global stats:", error)
      throw error
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      sessionId: this.sessionId,
      inputData: {
        age: this.age,
        glucose: this.glucose,
        bloodPressure: this.bloodPressure,
        bmi: this.bmi,
        skinThickness: this.skinThickness,
        insulin: this.insulin,
        diabetesPedigreeFunction: this.diabetesPedigreeFunction,
        pregnancies: this.pregnancies,
      },
      results: {
        prediction: this.predictionResult,
        probability: this.probability,
        confidence: this.confidence,
        riskLevel: this.riskLevel,
        modelVersion: this.modelVersion,
        predictedAt: this.predictedAt,
      },
      metadata: {
        ipAddress: this.ipAddress,
        userAgent: this.userAgent,
        deviceInfo: this.deviceInfo,
        locationData: this.locationData,
      },
      timestamps: {
        predictedAt: this.predictedAt,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      },
    }
  }
}

module.exports = PredictionHistory
