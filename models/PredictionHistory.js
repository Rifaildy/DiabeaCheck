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
        age,
        glucose,
        blood_pressure: bloodPressure,
        skin_thickness: skinThickness || null,
        insulin: insulin || null,
        bmi,
        diabetes_pedigree_function: diabetesPedigreeFunction || null,
        pregnancies: pregnancies || 0,
        prediction_result: predictionResult,
        probability,
        confidence,
        risk_level: riskLevel,
        model_version: modelVersion || "1.0.0",
        model_accuracy: modelAccuracy,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
        location_data: locationData ? JSON.stringify(locationData) : null,
        predicted_at: new Date(),
        created_at: new Date(),
      }

      const result = await db.insert("prediction_history", dbData)

      logger.info("Prediction history created", {
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

      const predictions = await db.findMany("prediction_history", { user_id: userId }, { limit, offset, orderBy })

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

  static async getTrendData(userId, days = 30) {
    try {
      const sql = `
        SELECT 
          DATE(predicted_at) as prediction_date,
          COUNT(*) as prediction_count,
          AVG(probability) as avg_probability,
          AVG(bmi) as avg_bmi,
          AVG(glucose) as avg_glucose,
          AVG(blood_pressure) as avg_blood_pressure
        FROM prediction_history 
        WHERE user_id = ? 
          AND predicted_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(predicted_at)
        ORDER BY prediction_date ASC
      `

      return await db.query(sql, [userId, days])
    } catch (error) {
      logger.error("Error getting trend data:", error)
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

      return await db.query(sql, [limit])
    } catch (error) {
      logger.error("Error getting recent predictions:", error)
      throw error
    }
  }

  async save() {
    try {
      if (this.id) {
        // Update existing prediction (rarely needed)
        const updateData = {
          confidence: this.confidence,
          model_version: this.modelVersion,
          model_accuracy: this.modelAccuracy,
          updated_at: new Date(),
        }

        await db.update("prediction_history", updateData, { id: this.id })
        this.updatedAt = updateData.updated_at
      } else {
        throw new Error("Use PredictionHistory.create() for creating new predictions")
      }

      return this
    } catch (error) {
      logger.error("Error saving prediction history:", error)
      throw error
    }
  }

  async delete() {
    try {
      if (!this.id) {
        throw new Error("Cannot delete prediction without ID")
      }

      await db.delete("prediction_history", { id: this.id })
      logger.info("Prediction history deleted", { predictionId: this.id })
    } catch (error) {
      logger.error("Error deleting prediction history:", error)
      throw error
    }
  }

  getRiskLevelIndonesian() {
    const riskLevels = {
      Low: "Rendah",
      Moderate: "Sedang",
      High: "Tinggi",
    }
    return riskLevels[this.riskLevel] || this.riskLevel
  }

  getFormattedProbability() {
    return `${Math.round(this.probability * 100)}%`
  }

  getInputSummary() {
    return {
      age: this.age,
      glucose: this.glucose,
      bloodPressure: this.bloodPressure,
      bmi: this.bmi,
      skinThickness: this.skinThickness,
      insulin: this.insulin,
      diabetesPedigreeFunction: this.diabetesPedigreeFunction,
      pregnancies: this.pregnancies,
    }
  }

  getResultSummary() {
    return {
      prediction: this.predictionResult,
      probability: this.probability,
      probabilityPercentage: this.getFormattedProbability(),
      confidence: this.confidence,
      riskLevel: this.riskLevel,
      riskLevelIndonesian: this.getRiskLevelIndonesian(),
      modelVersion: this.modelVersion,
      predictedAt: this.predictedAt,
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      sessionId: this.sessionId,
      inputData: this.getInputSummary(),
      results: this.getResultSummary(),
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
