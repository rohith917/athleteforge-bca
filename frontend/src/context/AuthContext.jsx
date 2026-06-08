/**
 * Authentication context — session bootstrap, login, logout, role state.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  authAPI,
  initCsrf,
  clearAuthTokens,
  setUnauthorizedHandler,
  getErrorMessage,
} from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const clearUser = useCallback(() => {
    setUser(null)
    clearAuthTokens()
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    const response = await authAPI.getUser()
    setUser(response.data)
    return response.data
  }, [])

  const bootstrapAuth = useCallback(async () => {
    try {
      await initCsrf()
      await fetchCurrentUser()
    } catch {
      clearUser()
    } finally {
      setInitializing(false)
    }
  }, [clearUser, fetchCurrentUser])

  useEffect(() => {
    bootstrapAuth()
  }, [bootstrapAuth])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearUser()
    })
    return () => setUnauthorizedHandler(null)
  }, [clearUser])

  const checkAuth = async () => {
    try {
      await initCsrf()
      return await fetchCurrentUser()
    } catch {
      clearUser()
      return null
    }
  }

  const login = async (emailOrUsername, password, useEmail = false) => {
    setActionLoading(true)
    try {
      await initCsrf()
      const payload = useEmail
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password }
      const response = await authAPI.login(payload)
      const loggedInUser = response.data?.user
      if (!loggedInUser) {
        throw new Error('Login succeeded but no user data was returned.')
      }
      setUser(loggedInUser)
      // Confirm session cookie works (critical on mobile / cross-origin Render)
      const verified = await fetchCurrentUser()
      if (!verified) {
        throw new Error('Session could not be established. Please try again.')
      }
      return response.data
    } finally {
      setActionLoading(false)
    }
  }

  const loginWithEmail = async (email, password) => login(email, password, true)

  const register = async (data) => {
    setActionLoading(true)
    try {
      await initCsrf()
      const response = await authAPI.register(data)
      const newUser = response.data?.user
      if (!newUser) {
        throw new Error('Registration succeeded but no user data was returned.')
      }
      setUser(newUser)
      await fetchCurrentUser()
      return response.data
    } finally {
      setActionLoading(false)
    }
  }

  const logout = async () => {
    setActionLoading(true)
    try {
      await initCsrf()
      await authAPI.logout()
    } catch {
      // Always clear client state even if server session already expired
    } finally {
      clearUser()
      setActionLoading(false)
    }
  }

  const isAdmin = Boolean(user?.is_admin || user?.role === 'admin')
  const isStudent = user?.role === 'student'
  const isCoach = user?.role === 'coach' || user?.is_staff_role
  const isStaff = isCoach || isAdmin

  return (
    <AuthContext.Provider value={{
      user,
      loading: initializing || actionLoading,
      initializing,
      actionLoading,
      login,
      loginWithEmail,
      register,
      logout,
      checkAuth,
      isAdmin,
      isStudent,
      isCoach,
      isStaff,
      getErrorMessage,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}