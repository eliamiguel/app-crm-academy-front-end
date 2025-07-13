export interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MANAGER" | "INSTRUCTOR"
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const getAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    }
  }

  const token = localStorage.getItem("token")
  const userStr = localStorage.getItem("user")

  if (!token || !userStr) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    }
  }

  try {
    const user = JSON.parse(userStr)
    return {
      user,
      token,
      isAuthenticated: true,
    }
  } catch (error) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    }
  }
}

export const logout = () => {
  if (typeof window !== "undefined") {
   
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    sessionStorage.clear()
  
    window.location.href = "/login"
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const isExpired = payload.exp * 1000 < Date.now()
    return isExpired
  } catch (error) {
    return true
  }
}

export const saveAuthData = (token: string, user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export const requireAuth = () => {
  const authState = getAuthState()
  
  if (!authState.isAuthenticated || (authState.token && isTokenExpired(authState.token))) {
    logout()
    return false
  }
  
  return true
}

export const redirectIfNotAuthenticated = () => {
  if (typeof window === "undefined") return
  
  if (!requireAuth()) {
    window.location.href = "/login"
  }
}

export const redirectIfAuthenticated = () => {
  if (typeof window === "undefined") return
  
  const authState = getAuthState()
  
  if (authState.isAuthenticated && !isTokenExpired(authState.token!)) {
    window.location.href = "/login"
  }
}