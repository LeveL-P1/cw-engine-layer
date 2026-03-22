"use client"

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback
} from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

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

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setToken(session.access_token)
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
          role: (session.user.user_metadata?.role as Role) || 'CONTRIBUTOR'
        })
      }
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setToken(session.access_token)
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
            role: (session.user.user_metadata?.role as Role) || 'CONTRIBUTOR'
          })
        } else {
          setToken(null)
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw new Error(error.message)
  }, [])

  const register = useCallback(async (
    email: string,
    name: string,
    password: string,
    confirmPassword: string
  ) => {
    if (password !== confirmPassword) {
      throw new Error("Passwords don't match")
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'CONTRIBUTOR'
        }
      }
    })
    if (error) throw new Error(error.message)
  }, [])

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }, [])

  const verifyEmail = useCallback(async (token: string) => {
    // Supabase handles email verification automatically
    // This might not be needed
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw new Error(error.message)
  }, [])

  const resetPassword = useCallback(async (token: string, newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords don't match")
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw new Error(error.message)
  }, [])

  const resendVerificationEmail = useCallback(async (email: string) => {
    // Supabase doesn't have a direct resend method, but resetPasswordForEmail can be used
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw new Error(error.message)
  }, [])

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerificationEmail
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
