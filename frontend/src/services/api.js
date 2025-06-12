const API_BASE_URL = process.env.REACT_APP_API_URL || "https://diabea-check.vercel.app"

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

  // Health check
  async checkHealth() {
    try {
      const response = await this.request("/health")
      return response
    } catch (error) {
      console.error("Health check error:", error)
      throw error
    }
  }

  // Database test
  async testDatabase() {
    try {
      const response = await this.request("/db-test")
      return response
    } catch (error) {
      console.error("Database test error:", error)
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
      // Just clear the token for now since we don't have a logout endpoint yet
      this.setToken(null)
      return { success: true, message: "Logged out successfully" }
    } catch (error) {
      console.error("Logout error:", error)
      this.setToken(null) // Clear token anyway
      throw error
    }
  }

  // User dashboard
  async getDashboard() {
    try {
      // For now, return mock data since the endpoint might not be ready
      return {
        success: true,
        dashboard: {
          user: {
            firstName: "User",
            lastName: "Test",
            email: "user@example.com",
          },
          stats: {
            total_predictions: 5,
            high_risk_count: 2,
            low_risk_count: 3,
          },
          recentPredictions: [
            {
              id: 1,
              risk_level: "High",
              probability: 0.85,
              predicted_at: new Date().toISOString(),
            },
            {
              id: 2,
              risk_level: "Low",
              probability: 0.25,
              predicted_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 3,
              risk_level: "Moderate",
              probability: 0.55,
              predicted_at: new Date(Date.now() - 172800000).toISOString(),
            },
          ],
        },
      }
    } catch (error) {
      console.error("Get dashboard error:", error)
      throw error
    }
  }

  // Prediction history
  async getPredictionHistory(page = 1, limit = 10) {
    try {
      // For now, return mock data
      return {
        success: true,
        predictions: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: i + 1,
            risk_level: Math.random() > 0.5 ? "High" : "Low",
            probability: Math.random(),
            predicted_at: new Date(Date.now() - i * 86400000).toISOString(),
            input_data: {
              age: 30 + i,
              glucose: 100 + i * 10,
              bmi: 25 + i,
            },
          })),
        pagination: {
          total: 5,
          page,
          limit,
          pages: 1,
        },
      }
    } catch (error) {
      console.error("Get prediction history error:", error)
      throw error
    }
  }

  // Delete prediction
  async deletePrediction(id) {
    try {
      // Mock successful deletion
      return {
        success: true,
        message: `Prediction ${id} deleted successfully`,
      }
    } catch (error) {
      console.error("Delete prediction error:", error)
      throw error
    }
  }

  // Prediction endpoints
  async predictDiabetes(inputData) {
    try {
      console.log("Sending prediction request with data:", inputData)
      // For now, return mock data
      return {
        success: true,
        data: {
          prediction: Math.random() > 0.5 ? 1 : 0,
          probability: Math.random(),
          risk_level: Math.random() > 0.5 ? "High" : "Low",
          recommendations: ["Maintain a healthy diet", "Exercise regularly", "Monitor blood sugar levels"],
        },
      }
    } catch (error) {
      console.error("Prediction API error:", error)
      throw error
    }
  }

  // Health tips
  async getHealthTips() {
    try {
      // Mock health tips
      return {
        success: true,
        tips: [
          {
            id: 1,
            title: "Makan Sehat",
            content: "Konsumsi makanan rendah gula dan karbohidrat kompleks",
          },
          {
            id: 2,
            title: "Olahraga Teratur",
            content: "Lakukan aktivitas fisik minimal 30 menit setiap hari",
          },
          {
            id: 3,
            title: "Cek Gula Darah",
            content: "Periksa kadar gula darah secara rutin",
          },
        ],
      }
    } catch (error) {
      console.error("Get health tips error:", error)
      throw error
    }
  }

  // User profile
  async getProfile() {
    try {
      // Mock profile data
      return {
        success: true,
        user: {
          id: 1,
          name: "User Test",
          email: "user@example.com",
          age: 30,
          gender: "Male",
          created_at: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      console.log("Updating profile:", profileData)
      // Mock successful update
      return {
        success: true,
        message: "Profile updated successfully",
        user: {
          ...profileData,
          id: 1,
          created_at: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  // Feedback
  async submitFeedback(feedbackData) {
    try {
      console.log("Submitting feedback:", feedbackData)
      // Mock successful submission
      return {
        success: true,
        message: "Feedback submitted successfully",
      }
    } catch (error) {
      console.error("Submit feedback error:", error)
      throw error
    }
  }
}

const apiService = new ApiService()

// Export individual functions for easier use
export const checkHealth = () => apiService.checkHealth()
export const testDatabase = () => apiService.testDatabase()
export const register = (userData) => apiService.register(userData)
export const login = (credentials) => apiService.login(credentials)
export const logout = () => apiService.logout()
export const getDashboard = () => apiService.getDashboard()
export const getPredictionHistory = (page, limit) => apiService.getPredictionHistory(page, limit)
export const deletePrediction = (id) => apiService.deletePrediction(id)
export const predictDiabetes = (inputData) => apiService.predictDiabetes(inputData)
export const getHealthTips = () => apiService.getHealthTips()
export const getProfile = () => apiService.getProfile()
export const updateProfile = (profileData) => apiService.updateProfile(profileData)
export const submitFeedback = (feedbackData) => apiService.submitFeedback(feedbackData)

export default apiService
