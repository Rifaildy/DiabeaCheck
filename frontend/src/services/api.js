// OPTION 1: Base URL dengan /api suffix (sesuai dokumentasi backend)
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://apideabeacheck-153b.vercel.app/api"

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

  // Health check - SPECIAL CASE: use root /health endpoint
  async checkHealth() {
    try {
      // Use root health endpoint (not /api/health)
      const response = await fetch("https://apideabeacheck-153b.vercel.app/health")
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Health check error:", error)
      throw error
    }
  }

  // Auth endpoints - NO /api prefix since base URL already has /api
  async register(userData) {
    try {
      console.log("Registering user:", userData)
      // Ensure proper data format for backend
      const registerData = {
        email: userData.email,
        password: userData.password,
        name: userData.name || userData.firstName || "User", // Handle different name formats
      }

      const response = await this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(registerData),
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
      const response = await this.request("/auth/logout", {
        method: "POST",
      })
      this.setToken(null)
      return response
    } catch (error) {
      console.error("Logout error:", error)
      this.setToken(null)
      throw error
    }
  }

  // User endpoints - Try different endpoint paths
  async getProfile() {
    try {
      // Try /auth/me first (as mentioned in documentation)
      const response = await this.request("/auth/me")
      return response
    } catch (error) {
      console.error("Get profile error:", error)
      // If /auth/me fails, return mock data for testing
      return {
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
        },
      }
    }
  }

  async updateProfile(profileData) {
    try {
      console.log("Updating profile:", profileData)
      const response = await this.request("/user/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      })
      return response
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  // Dashboard data
  async getDashboard() {
    try {
      const response = await this.getProfile()
      return {
        success: true,
        dashboard: {
          user: response.user || {
            firstName: "User",
            lastName: "Test",
            email: "user@example.com",
          },
          stats: {
            total_predictions: 0,
            high_risk_count: 0,
            low_risk_count: 0,
          },
          recentPredictions: [],
        },
      }
    } catch (error) {
      console.error("Get dashboard error:", error)
      throw error
    }
  }

  // Prediction endpoints - NO /api prefix since base URL already has /api
  async predictDiabetes(inputData) {
    try {
      console.log("Sending prediction request with data:", inputData)
      const response = await this.request("/prediction", {
        method: "POST",
        body: JSON.stringify(inputData),
      })
      return response
    } catch (error) {
      console.error("Prediction API error:", error)
      throw error
    }
  }

  async getPredictionHistory(page = 1, limit = 10) {
    try {
      const response = await this.request(`/prediction?page=${page}&limit=${limit}`)
      return response
    } catch (error) {
      console.error("Get prediction history error:", error)
      throw error
    }
  }

  async deletePrediction(id) {
    try {
      const response = await this.request(`/prediction/${id}`, {
        method: "DELETE",
      })
      return response
    } catch (error) {
      console.error("Delete prediction error:", error)
      throw error
    }
  }

  // Feedback endpoint - NO /api prefix since base URL already has /api
  async submitFeedback(feedbackData) {
    try {
      console.log("Submitting feedback:", feedbackData)
      const response = await this.request("/feedback", {
        method: "POST",
        body: JSON.stringify(feedbackData),
      })
      return response
    } catch (error) {
      console.error("Submit feedback error:", error)
      throw error
    }
  }

  // Health tips (mock data for now)
  async getHealthTips() {
    try {
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
}

const apiService = new ApiService()

// Export individual functions for easier use
export const checkHealth = () => apiService.checkHealth()
export const register = (userData) => apiService.register(userData)
export const login = (credentials) => apiService.login(credentials)
export const logout = () => apiService.logout()
export const getProfile = () => apiService.getProfile()
export const updateProfile = (profileData) => apiService.updateProfile(profileData)
export const getDashboard = () => apiService.getDashboard()
export const getPredictionHistory = (page, limit) => apiService.getPredictionHistory(page, limit)
export const deletePrediction = (id) => apiService.deletePrediction(id)
export const predictDiabetes = (inputData) => apiService.predictDiabetes(inputData)
export const getHealthTips = () => apiService.getHealthTips()
export const submitFeedback = (feedbackData) => apiService.submitFeedback(feedbackData)

export default apiService
