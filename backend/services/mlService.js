const axios = require("axios")
const logger = require("../utils/logger")

class MLService {
  constructor() {
    this.mlApiUrl = process.env.ML_API_URL || "http://localhost:8000"
    this.timeout = 30000 // 30 seconds timeout
  }

  async predictDiabetes(inputData) {
    try {
      // Transform input data to match ML API format
      const mlInput = {
        Age: Number(inputData.age) || 0,
        BMI: Number(inputData.bmi) || 0,
        Glucose: Number(inputData.glucose) || 0,
        Insulin: Number(inputData.insulin) || 0,
        BloodPressure: Number(inputData.bloodPressure) || 0,
      }

      logger.info("Calling ML API", {
        url: `${this.mlApiUrl}/predict/`,
        input: mlInput,
      })

      // Call external ML API
      const response = await axios.post(`${this.mlApiUrl}/predict/`, mlInput, {
        timeout: this.timeout,
        headers: {
          "Content-Type": "application/json",
        },
      })

      const mlResult = response.data

      // Transform ML API response to our format
      const result = {
        prediction: mlResult.prediction, // 0 or 1
        probability: mlResult.probability,
        risk_level: this.getRiskLevel(mlResult.probability),
        label: mlResult.label,
        recommendations: this.generateRecommendations(mlResult, mlInput),
        confidence: mlResult.probability > 0.5 ? mlResult.probability : 1 - mlResult.probability,
      }

      logger.info("ML API prediction successful", { result })
      return result
    } catch (error) {
      logger.error("ML API prediction failed", {
        error: error.message,
        url: this.mlApiUrl,
        inputData,
      })

      // Return error object instead of throwing
      return {
        error: this.handleMLError(error),
        prediction: null,
        probability: null,
        risk_level: "Unknown",
        recommendations: ["Konsultasikan dengan dokter untuk evaluasi lebih lanjut"],
      }
    }
  }

  getRiskLevel(probability) {
    if (probability >= 0.7) return "High"
    if (probability >= 0.3) return "Moderate"
    return "Low"
  }

  generateRecommendations(mlResult, inputData) {
    const recommendations = []

    // Base recommendations based on prediction
    if (mlResult.prediction === 1) {
      recommendations.push("⚠️ Hasil menunjukkan risiko diabetes tinggi")
      recommendations.push("🏥 Segera konsultasi dengan dokter untuk pemeriksaan lebih lanjut")
      recommendations.push("💊 Ikuti rencana pengobatan yang direkomendasikan dokter")
    } else {
      recommendations.push("✅ Hasil menunjukkan risiko diabetes rendah")
      recommendations.push("🎯 Pertahankan gaya hidup sehat untuk mencegah diabetes")
    }

    // Specific recommendations based on input values
    if (inputData.BMI >= 25) {
      recommendations.push("⚖️ BMI Anda tinggi, pertimbangkan program penurunan berat badan")
      recommendations.push("🏃‍♂️ Tingkatkan aktivitas fisik minimal 150 menit per minggu")
    }

    if (inputData.Glucose >= 126) {
      recommendations.push("🍯 Kadar glukosa tinggi, batasi konsumsi gula dan karbohidrat sederhana")
      recommendations.push("🥗 Konsumsi makanan dengan indeks glikemik rendah")
    }

    if (inputData.BloodPressure >= 140) {
      recommendations.push("💓 Tekanan darah tinggi, kurangi konsumsi garam")
      recommendations.push("🧘‍♀️ Lakukan teknik relaksasi untuk mengurangi stres")
    }

    if (inputData.Age >= 45) {
      recommendations.push("👴 Usia adalah faktor risiko, lakukan pemeriksaan rutin setiap 6 bulan")
    }

    // General health recommendations
    recommendations.push("🥬 Konsumsi makanan seimbang dengan banyak sayuran dan buah")
    recommendations.push("💧 Minum air putih minimal 8 gelas per hari")
    recommendations.push("😴 Tidur cukup 7-8 jam per hari")
    recommendations.push("🚭 Hindari merokok dan konsumsi alkohol berlebihan")

    return recommendations
  }

  handleMLError(error) {
    if (error.code === "ECONNREFUSED") {
      return "ML API server tidak dapat diakses. Pastikan server ML berjalan di port 8000."
    }

    if (error.response) {
      // API responded with error status
      const status = error.response.status
      const data = error.response.data

      if (status === 422) {
        return `Validasi data gagal: ${JSON.stringify(data.detail)}`
      }

      if (status === 500) {
        return "Terjadi kesalahan pada server ML. Model mungkin tidak tersedia."
      }

      return `ML API error (${status}): ${data.detail || error.message}`
    }

    if (error.code === "ECONNABORTED") {
      return "Timeout: ML API tidak merespons dalam waktu yang ditentukan."
    }

    return `Kesalahan tidak terduga: ${error.message}`
  }

  // Health check for ML API
  async healthCheck() {
    try {
      const response = await axios.get(`${this.mlApiUrl}/docs`, {
        timeout: 5000,
      })
      return {
        status: "healthy",
        url: this.mlApiUrl,
        response_time: response.headers["x-response-time"] || "N/A",
      }
    } catch (error) {
      return {
        status: "unhealthy",
        url: this.mlApiUrl,
        error: error.message,
      }
    }
  }
}

// Export the class, not an instance
module.exports = MLService
