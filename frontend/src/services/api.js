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

  // Prediction endpoints (placeholder for now)
  async predictDiabetes(inputData) {
    try {
      console.log("Sending prediction request with data:", inputData)
      // For now, return a mock response since we haven't implemented the prediction endpoint yet
      return {
        success: true,
        prediction: Math.random() > 0.5 ? "High Risk" : "Low Risk",
        confidence: Math.random() * 100,
        recommendations: ["Maintain a healthy diet", "Exercise regularly", "Monitor blood sugar levels"],
      }
    } catch (error) {
      console.error("Prediction API error:", error)
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
export const predictDiabetes = (inputData) => apiService.predictDiabetes(inputData)

export default apiService
