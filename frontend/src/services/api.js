const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem("token")
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("token")
    }
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(),
      ...options,
    }

    try {
      console.log("Making request to:", url)
      console.log("Request config:", config)

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Response data:", data)
      return data
    } catch (error) {
      console.error("API Request failed:", error)

      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Tidak dapat terhubung ke server. Pastikan server backend berjalan.")
      }

      throw error
    }
  }

  // Prediction endpoints
  async predictDiabetes(inputData) {
    try {
      console.log("Sending prediction request with data:", inputData)
      const response = await this.request("/prediction/diabetes", {
        method: "POST",
        body: JSON.stringify(inputData),
      })

      console.log("Prediction response:", response)

      if (!response.success) {
        throw new Error(response.message || response.error || "Prediction failed")
      }

      // Return the data part of the response
      return response.data
    } catch (error) {
      console.error("Prediction API error:", error)
      throw error
    }
  }

  // Health check for ML service
  async checkMLHealth() {
    try {
      const response = await this.request("/prediction/health")
      return response.data
    } catch (error) {
      console.error("ML health check error:", error)
      throw error
    }
  }

  // Test prediction
  async testPrediction() {
    try {
      const response = await this.request("/prediction/test")
      return response.data
    } catch (error) {
      console.error("Test prediction error:", error)
      throw error
    }
  }

  // Auth endpoints
  async register(userData) {
    try {
      console.log("Registering user:", userData)
      const response = await this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      if (response.token) {
        this.setToken(response.token)
      }

      return response
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  async login(credentials) {
    try {
      console.log("Logging in user:", { email: credentials.email })
      const response = await this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      })

      if (response.token) {
        this.setToken(response.token)
      }

      return response
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.setToken(null)
    }
  }

  async getProfile() {
    return this.request("/auth/me")
  }

  async updateProfile(profileData) {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  // User endpoints
  async getDashboard() {
    return this.request("/user/dashboard")
  }

  async getPredictionHistory(page = 1, limit = 10) {
    return this.request(`/user/predictions?page=${page}&limit=${limit}`)
  }

  async deletePrediction(id) {
    return this.request(`/user/predictions/${id}`, {
      method: "DELETE",
    })
  }

  async getHealthTips() {
    return this.request("/health/tips")
  }

  async submitFeedback(feedbackData) {
    return this.request("/feedback", {
      method: "POST",
      body: JSON.stringify(feedbackData),
    })
  }
}

const apiService = new ApiService()

// Export individual functions for easier use
export const register = (userData) => apiService.register(userData)
export const login = (credentials) => apiService.login(credentials)
export const logout = () => apiService.logout()
export const getProfile = () => apiService.getProfile()
export const updateProfile = (profileData) => apiService.updateProfile(profileData)
export const predictDiabetes = (inputData) => apiService.predictDiabetes(inputData)
export const checkMLHealth = () => apiService.checkMLHealth()
export const testPrediction = () => apiService.testPrediction()
export const getDashboard = () => apiService.getDashboard()
export const getPredictionHistory = (page, limit) => apiService.getPredictionHistory(page, limit)
export const deletePrediction = (id) => apiService.deletePrediction(id)
export const getHealthTips = () => apiService.getHealthTips()
export const submitFeedback = (feedbackData) => apiService.submitFeedback(feedbackData)

export default apiService
