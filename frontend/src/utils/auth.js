// Simple authentication utility functions

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token")
  return !!token // Returns true if token exists, false otherwise
}

// Get the current user's token
export const getToken = () => {
  return localStorage.getItem("token")
}

// Get the current user's data (if any)
export const getCurrentUser = () => {
  const userString = localStorage.getItem("user")
  if (!userString) return null

  try {
    return JSON.parse(userString)
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

// Set the current user's data
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user))
  } else {
    localStorage.removeItem("user")
  }
}

// Login user (set token and user data)
export const loginUser = (token, user) => {
  localStorage.setItem("token", token)
  setCurrentUser(user)
}

// Logout user (clear token and user data)
export const logoutUser = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true

  try {
    // Get the payload part of the JWT
    const payload = token.split(".")[1]
    // Decode the base64 string
    const decoded = JSON.parse(atob(payload))
    // Check if the token is expired
    return decoded.exp < Date.now() / 1000
  } catch (error) {
    console.error("Error checking token expiration:", error)
    return true // Assume expired if there's an error
  }
}

// Refresh token if needed (placeholder for future implementation)
export const refreshTokenIfNeeded = async () => {
  // This would be implemented if you have a refresh token endpoint
  // For now, just check if token is expired
  const token = getToken()
  if (token && isTokenExpired(token)) {
    // Token is expired, log the user out
    logoutUser()
    return false
  }
  return true
}
