/**
 * Authentication context — login, register, logout, role-aware user state.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await authAPI.getUser()
      setUser(response.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (emailOrUsername, password, useEmail = false) => {
    const payload = useEmail
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password }
    const response = await authAPI.login(payload)
    setUser(response.data.user)
    return response.data
  }

  const loginWithEmail = async (email, password) => login(email, password, true)

  const register = async (data) => {
    const response = await authAPI.register(data)
    setUser(response.data.user)
    return response.data
  }

  const logout = async () => {
    await authAPI.logout()
    setUser(null)
  }

  const isStudent = user?.role === 'student'
  const isCoach = user?.role === 'coach' || user?.role === 'admin' || user?.is_staff_role

  return (
    <AuthContext.Provider value={{
      user, loading, login, loginWithEmail, register, logout, checkAuth,
      isStudent, isCoach, isStaff: isCoach,
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