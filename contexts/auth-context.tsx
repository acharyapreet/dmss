"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export type UserRole = "admin" | "manager" | "user"

export interface User {
  _id?: string
  id?: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: UserRole
  department?: string
  position?: string
  avatar?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  isLoading: boolean
  token: string | null
  error: string | null
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: string
  department?: string
  position?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken")
    const savedUser = localStorage.getItem("user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      try {
        const parsedUser = JSON.parse(savedUser)
        // Validate user object structure
        if (!parsedUser || typeof parsedUser !== 'object' || !parsedUser.email) {
          throw new Error('Invalid user data structure')
        }
        // Ensure user object has proper structure
        const cleanUser = {
          _id: parsedUser._id || parsedUser.id,
          email: parsedUser.email || '',
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          fullName: parsedUser.fullName || '',
          role: parsedUser.role || 'user',
          department: parsedUser.department,
          position: parsedUser.position,
          avatar: parsedUser.avatar,
          lastLogin: parsedUser.lastLogin
        }
        setUser(cleanUser)
      } catch (e) {
        console.error("Failed to parse saved user:", e)
        // Clear corrupted data
        localStorage.removeItem("authToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
      }
    }
  }, [])

  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      const { token, refreshToken, user: userResponse } = data.data

      // Clean user data before saving
      const cleanUser = {
        _id: userResponse._id || userResponse.id,
        email: userResponse.email || '',
        firstName: userResponse.firstName || '',
        lastName: userResponse.lastName || '',
        fullName: userResponse.fullName || '',
        role: userResponse.role || 'user',
        department: userResponse.department,
        position: userResponse.position,
        avatar: userResponse.avatar,
        lastLogin: userResponse.lastLogin
      }

      // Save token and user to localStorage
      localStorage.setItem("authToken", token)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(cleanUser))

      setToken(token)
      setUser(cleanUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      const { token, refreshToken, user: userResponse } = data.data

      // Clean user data before saving
      const cleanUser = {
        _id: userResponse._id || userResponse.id,
        email: userResponse.email || '',
        firstName: userResponse.firstName || '',
        lastName: userResponse.lastName || '',
        fullName: userResponse.fullName || '',
        role: userResponse.role || 'user',
        department: userResponse.department,
        position: userResponse.position,
        avatar: userResponse.avatar,
        lastLogin: userResponse.lastLogin
      }

      // Save token and user to localStorage
      localStorage.setItem("authToken", token)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(cleanUser))

      setToken(token)
      setUser(cleanUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint if token exists
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        })
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      // Clear local state and storage
      localStorage.removeItem("authToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      setToken(null)
      setUser(null)
      setError(null)
    }
  }, [token])

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      // Ensure clean user data structure
      const cleanUser = {
        _id: updatedUser._id || updatedUser.id,
        email: updatedUser.email || '',
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        fullName: updatedUser.fullName || '',
        role: updatedUser.role || 'user',
        department: updatedUser.department,
        position: updatedUser.position,
        avatar: updatedUser.avatar,
        lastLogin: updatedUser.lastLogin
      }
      setUser(cleanUser)
      localStorage.setItem("user", JSON.stringify(cleanUser))
    }
  }, [user])


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        isLoading,
        token,
        error
      }}
    >
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
