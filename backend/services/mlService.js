const axios = require("axios")
const logger = require("../utils/logger")

class MLService {
  constructor() {
    this.apiUrl = process.env.ML_API_URL || "http://localhost:8000"
    this.timeout = 30000 // 30 seconds
  }

  async predictDiabetes(inputData) {
    try {
      logger.info("Calling ML API with:", inputData)

      // Prepare data for ML API (exact format as documented)
      const mlApiData = {
        Age: Number.parseFloat(inputData.age),
        BMI: Number.parseFloat(inputData.bmi),
        Glucose: Number.parseFloat(inputData.glucose),
        Insulin: Number.parseFloat(inputData.insulin || 0),
        BloodPressure: Number.parseFloat(inputData.bloodPressure),
      }

      // Call ML API
      const response = await axios.post(`${this.apiUrl}/predict/`, mlApiData, {
        timeout: this.timeout,
        headers: {
          "Content-Type": "application/json",
        },
      })

      const mlResult = response.data
      logger.info("ML API response:", mlResult)

      // Process ML API response correctly
      const prediction = mlResult.prediction // 'Diabetes' or 'Tidak Diabetes'
      const probability = mlResult.probability // 0.0 to 1.0
      const rawOutput = mlResult.raw_output // 0 or 1

      // Determine risk level based on actual prediction
      let riskLevel, confidence, message

      if (prediction === "Diabetes" || rawOutput === 1) {
        // High risk case
        riskLevel = "High"
        confidence = probability
        message = `Risiko diabetes tinggi dengan probabilitas ${Math.round(probability * 100)}%`
      } else {
        // Low risk case
        riskLevel = "Low"
        confidence = 1 - probability
        message = `Risiko diabetes rendah dengan probabilitas ${Math.round((1 - probability) * 100)}%`
      }

      // Generate recommendations based on input data and prediction
      const recommendations = this.generateRecommendations(inputData, prediction, rawOutput)

      const result = {
        prediction: prediction,
        probability: probability,
        confidence: confidence,
        risk_level: riskLevel,
        label: prediction,
        message: message,
        recommendations: recommendations,
        model_info: {
          model_type: "MLP Neural Network",
          threshold: 0.5,
          accuracy: null,
        },
        raw_output: rawOutput,
        input_data: inputData,
      }

      logger.info("Processed prediction result:", result)
      return result
    } catch (error) {
      logger.error("ML Service error:", error.message)

      if (error.code === "ECONNREFUSED") {
        throw new Error("ML API server is not running. Please start the ML service.")
      }

      if (error.response) {
        logger.error("ML API error response:", error.response.data)
        throw new Error(`ML API error: ${error.response.data.detail || error.response.statusText}`)
      }

      throw new Error(`ML Service error: ${error.message}`)
    }
  }

  generateRecommendations(inputData, prediction, rawOutput) {
    const recommendations = []
    const age = Number.parseFloat(inputData.age)
    const bmi = Number.parseFloat(inputData.bmi)
    const glucose = Number.parseFloat(inputData.glucose)
    const bloodPressure = Number.parseFloat(inputData.bloodPressure)
    const insulin = Number.parseFloat(inputData.insulin || 0)

    // Base recommendations based on prediction
    if (prediction === "Diabetes" || rawOutput === 1) {
      recommendations.push("🚨 Hasil menunjukkan risiko diabetes tinggi")
      recommendations.push("👨‍⚕️ Segera konsultasi dengan dokter untuk pemeriksaan lebih lanjut")
      recommendations.push("📋 Lakukan tes HbA1c dan tes toleransi glukosa")
    } else {
      recommendations.push("✅ Hasil menunjukkan risiko diabetes rendah")
      recommendations.push("🎯 Pertahankan gaya hidup sehat untuk mencegah diabetes")
      recommendations.push("📅 Lakukan pemeriksaan rutin setiap tahun")
    }

    // BMI-based recommendations
    if (bmi >= 30) {
      recommendations.push("⚖️ BMI Anda tinggi, pertimbangkan program penurunan berat badan")
      recommendations.push("🏃‍♂️ Tingkatkan aktivitas fisik minimal 150 menit per minggu")
      recommendations.push("🥗 Konsultasi dengan ahli gizi untuk diet seimbang")
    } else if (bmi >= 25) {
      recommendations.push("⚖️ BMI Anda sedikit tinggi, jaga berat badan ideal")
      recommendations.push("🚶‍♂️ Lakukan olahraga ringan secara teratur")
    }

    // Glucose-based recommendations
    if (glucose >= 140) {
      recommendations.push("🚨 Kadar glukosa sangat tinggi, segera konsultasi dokter")
      recommendations.push("🥬 Konsumsi makanan dengan indeks glikemik rendah")
      recommendations.push("⏰ Atur jadwal makan yang teratur")
    } else if (glucose >= 100) {
      recommendations.push("🍯 Kadar glukosa sedikit tinggi, batasi konsumsi gula")
      recommendations.push("🥬 Konsumsi makanan dengan indeks glikemik rendah")
    }

    // Blood pressure recommendations
    if (bloodPressure >= 140) {
      recommendations.push("💓 Tekanan darah tinggi, kurangi konsumsi garam")
      recommendations.push("🧘‍♀️ Lakukan teknik relaksasi untuk mengurangi stres")
      recommendations.push("🚭 Hindari merokok dan alkohol")
    }

    // Age-based recommendations
    if (age >= 45) {
      recommendations.push("👴 Usia adalah faktor risiko, lakukan pemeriksaan rutin setiap 6 bulan")
      recommendations.push("💪 Pertahankan massa otot dengan latihan kekuatan")
    }

    // General health recommendations
    recommendations.push("🥬 Konsumsi makanan seimbang dengan banyak sayuran dan buah")
    recommendations.push("💧 Minum air putih minimal 8 gelas per hari")
    recommendations.push("😴 Tidur cukup 7-8 jam per hari")
    recommendations.push("📱 Gunakan aplikasi untuk memantau kesehatan")

    return recommendations
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.apiUrl}/`, {
        timeout: 5000,
      })

      return {
        status: "healthy",
        url: this.apiUrl,
        response_time: "N/A",
        message: "ML API server is running",
      }
    } catch (error) {
      logger.error("Health check failed:", error.message)
      throw new Error("ML API server is not accessible")
    }
  }

  async testPrediction() {
    const testData = {
      age: 45,
      bmi: 28.5,
      glucose: 120,
      insulin: 50,
      bloodPressure: 80,
    }

    try {
      const result = await this.predictDiabetes(testData)
      return {
        status: "success",
        message: "Test prediction successful",
        result: result,
      }
    } catch (error) {
      throw new Error(`Test prediction failed: ${error.message}`)
    }
  }
}

module.exports = MLService
