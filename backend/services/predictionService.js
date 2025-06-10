const logger = require("../utils/logger")

class PredictionService {
  constructor() {
    this.isModelLoaded = true // Mock model always "loaded"
  }

  // Initialize and load the ML model (mock)
  async loadModel() {
    try {
      if (this.isModelLoaded) {
        return
      }

      logger.info("Loading diabetes prediction model...")

      // Mock model loading
      this.isModelLoaded = true
      logger.info("Mock model loaded successfully")
    } catch (error) {
      logger.error("Failed to load model:", error)
      throw new Error("Model loading failed")
    }
  }

  // Preprocess input data
  preprocessData(inputData) {
    // Fill missing values with defaults
    const processedData = {
      age: Number.parseFloat(inputData.age),
      glucose: Number.parseFloat(inputData.glucose),
      bloodPressure: Number.parseFloat(inputData.bloodPressure),
      skinThickness: Number.parseFloat(inputData.skinThickness) || 20, // median value
      insulin: Number.parseFloat(inputData.insulin) || 79, // median value
      bmi: Number.parseFloat(inputData.bmi),
      diabetesPedigreeFunction: Number.parseFloat(inputData.diabetesPedigreeFunction) || 0.3725, // median value
      pregnancies: Number.parseInt(inputData.pregnancies) || 0,
    }

    return processedData
  }

  // Get risk level and recommendations
  getRiskAssessment(probability) {
    if (probability < 0.3) {
      return {
        riskLevel: "Low",
        message: "Low risk of diabetes detected. Continue maintaining a healthy lifestyle.",
        recommendations: [
          "Maintain a balanced diet with plenty of vegetables and whole grains",
          "Continue regular physical activity (at least 150 minutes per week)",
          "Monitor your weight and maintain a healthy BMI",
          "Get regular health check-ups",
          "Avoid smoking and limit alcohol consumption",
        ],
      }
    } else if (probability < 0.7) {
      return {
        riskLevel: "Moderate",
        message:
          "Moderate risk of diabetes detected. Consider lifestyle modifications and consult healthcare provider.",
        recommendations: [
          "Consult with a healthcare provider for personalized advice",
          "Focus on weight management if overweight",
          "Increase physical activity to at least 200 minutes per week",
          "Follow a diabetes-prevention diet plan",
          "Monitor blood glucose levels regularly",
          "Consider diabetes prevention programs",
        ],
      }
    } else {
      return {
        riskLevel: "High",
        message: "High risk of diabetes detected. Immediate consultation with healthcare provider recommended.",
        recommendations: [
          "Schedule an immediate appointment with your healthcare provider",
          "Get comprehensive diabetes screening tests",
          "Start intensive lifestyle modification program",
          "Consider medication if recommended by doctor",
          "Monitor blood glucose levels daily",
          "Join a diabetes prevention support group",
          "Work with a nutritionist for meal planning",
        ],
      }
    }
  }

  // Mock prediction based on medical knowledge
  generateMockPrediction(inputData) {
    const { age, glucose, bloodPressure, bmi, diabetesPedigreeFunction, pregnancies } = inputData

    let riskScore = 0

    // Age factor
    if (age > 45) riskScore += 0.2
    else if (age > 35) riskScore += 0.1

    // Glucose factor (most important)
    if (glucose > 140) riskScore += 0.4
    else if (glucose > 100) riskScore += 0.2

    // BMI factor
    if (bmi > 30) riskScore += 0.2
    else if (bmi > 25) riskScore += 0.1

    // Blood pressure factor
    if (bloodPressure > 140) riskScore += 0.1

    // Family history factor
    if (diabetesPedigreeFunction > 0.5) riskScore += 0.1

    // Pregnancy factor
    if (pregnancies > 3) riskScore += 0.05

    // Add some randomness to simulate model uncertainty
    riskScore += (Math.random() - 0.5) * 0.1

    // Ensure score is between 0 and 1
    riskScore = Math.max(0, Math.min(1, riskScore))

    return riskScore
  }

  // Main prediction method
  async predict(inputData) {
    try {
      // Ensure model is loaded
      if (!this.isModelLoaded) {
        await this.loadModel()
      }

      // Preprocess input data
      const processedInput = this.preprocessData(inputData)

      // Generate mock prediction
      const diabetesProbability = this.generateMockPrediction(processedInput)
      const prediction_class = diabetesProbability > 0.5 ? 1 : 0

      // Calculate confidence (distance from decision boundary)
      const confidence = Math.abs(diabetesProbability - 0.5) * 2

      // Get risk assessment and recommendations
      const riskAssessment = this.getRiskAssessment(diabetesProbability)

      logger.info("Mock prediction generated", {
        probability: diabetesProbability,
        prediction: prediction_class,
        riskLevel: riskAssessment.riskLevel,
      })

      return {
        prediction: prediction_class,
        probability: diabetesProbability,
        confidence: confidence,
        riskLevel: riskAssessment.riskLevel,
        message: riskAssessment.message,
        recommendations: riskAssessment.recommendations,
      }
    } catch (error) {
      logger.error("Prediction service error:", error)
      throw new Error("Failed to generate prediction")
    }
  }

  // Get model statistics
  getModelStats() {
    return {
      isLoaded: this.isModelLoaded,
      modelType: "Random Forest (Mock)",
      features: 8,
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.78,
      f1Score: 0.8,
    }
  }
}

// Export singleton instance
module.exports = new PredictionService()
