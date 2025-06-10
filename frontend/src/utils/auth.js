// Authentication utilities
export const getToken = () => {
  return localStorage.getItem("token")
}

export const setToken = (token) => {
  localStorage.setItem("token", token)
}

export const removeToken = () => {
  localStorage.removeItem("token")
}

export const isAuthenticated = () => {
  const token = getToken()
  if (!token) return false

  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000

    if (payload.exp < currentTime) {
      removeToken()
      return false
    }

    return true
  } catch (error) {
    removeToken()
    return false
  }
}

export const getUserFromToken = () => {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload
  } catch (error) {
    return null
  }
}

export const logout = () => {
  removeToken()
  window.location.href = "/login"
}
