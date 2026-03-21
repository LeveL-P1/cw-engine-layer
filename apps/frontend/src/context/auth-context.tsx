"use client"

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback
} from "react"

export type Role = "FACILITATOR" | "CONTRIBUTOR" | "OBSERVER"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
  verifyEmail: (token: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken")
    if (savedToken) {
      setToken(savedToken)
      // Optional: Validate token with backend
      validateToken(savedToken)
    }
    setIsLoading(false)
  }, [])

  const validateToken = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) {
        localStorage.removeItem("authToken")
        setToken(null)
      }
    } catch (error) {
      console.error("Token validation failed:", error)
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await res.json()
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem("authToken", data.token)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (
    email: string,
    name: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, confirmPassword })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Registration failed")
      }

      const data = await res.json()
      // Don't auto-login, user needs to verify email first
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("authToken")
  }, [])

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Email verification failed")
      }

      return await res.json()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Password reset request failed")
      }

      return await res.json()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Password reset failed")
      }

      return await res.json()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to resend verification email")
      }

      return await res.json()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerificationEmail
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
