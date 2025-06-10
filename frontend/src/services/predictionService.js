import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api"

class PredictionService {
  async predictDiabetes(patientData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/prediction/diabetes`, patientData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Prediction failed")
    }
  }

  async getModelInfo() {
    try {
      const response = await axios.get(`${API_BASE_URL}/prediction/model-info`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to get model info")
    }
  }
}

export default new PredictionService()
