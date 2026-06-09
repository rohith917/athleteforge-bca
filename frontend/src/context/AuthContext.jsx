/**
 * Authentication context — session bootstrap, login, logout, role state.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  authAPI,
  initCsrf,
  wakeServer,
  markServerAwake,
  clearAuthTokens,
  setUnauthorizedHandler,
  getErrorMessage,
} from '../services/api'

const AuthContext = createContext(null)

function isNotLoggedInError(err) {
  const status = err?.response?.status
  return status === 401 || status === 403
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState('waking')
  const [bootstrapMessage, setBootstrapMessage] = useState('Connecting to server...')

  const authGeneration = useRef(0)

  const clearUser = useCallback(() => {
    setUser(null)
    clearAuthTokens()
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    const response = await authAPI.getUser()
    setUser(response.data)
    markServerAwake()
    return response.data
  }, [])

  const bootstrapAuth = useCallback(async ({ silent = false, isRetry = false } = {}) => {
    const gen = ++authGeneration.current
    if (!silent && isRetry) {
      setAuthChecked(false)
      setBootstrapMessage('Waking server (first visit may take up to 60s)...')
    } else if (!silent) {
      setBootstrapMessage('Waking server (first visit may take up to 60s)...')
    }
    setApiStatus('waking')

    try {
      await wakeServer()
      if (gen !== authGeneration.current) return

      setBootstrapMessage('Checking your session...')
      await initCsrf()
      if (gen !== authGeneration.current) return

      try {
        await fetchCurrentUser()
      } catch (err) {
        if (gen !== authGeneration.current) return
        if (isNotLoggedInError(err)) {
          clearUser()
          setApiStatus('ok')
          return
        }
        throw err
      }
      if (gen !== authGeneration.current) return
      setApiStatus('ok')
    } catch {
      if (gen !== authGeneration.current) return
      clearUser()
      setApiStatus('error')
    } finally {
      if (gen === authGeneration.current) {
        setAuthChecked(true)
      }
    }
  }, [clearUser, fetchCurrentUser])

  useEffect(() => {
    let active = true
    const run = async () => {
      await bootstrapAuth({ silent: true })
      if (!active) return
    }
    run()
    return () => {
      active = false
      authGeneration.current += 1
    }
  }, [bootstrapAuth])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearUser()
    })
    return () => setUnauthorizedHandler(null)
  }, [clearUser])

  const checkAuth = async () => {
    try {
      await wakeServer()
      await initCsrf()
      return await fetchCurrentUser()
    } catch (err) {
      if (isNotLoggedInError(err)) {
        clearUser()
        return null
      }
      clearUser()
      setApiStatus('error')
      return null
    }
  }

  const login = async (emailOrUsername, password, useEmail = false) => {
    authGeneration.current += 1
    setActionLoading(true)
    setBootstrapMessage('Signing in...')
    try {
      await wakeServer()
      await initCsrf()
      const payload = useEmail
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password }
      const response = await authAPI.login(payload)
      const loggedInUser = response.data?.user
      if (!loggedInUser) {
        throw new Error('Login succeeded but no user data was returned.')
      }
      const verified = await fetchCurrentUser()
      if (!verified?.id) {
        throw new Error('Session could not be established. Please try again.')
      }
      markServerAwake()
      setApiStatus('ok')
      setAuthChecked(true)
      return response.data
    } finally {
      setActionLoading(false)
    }
  }

  const loginWithEmail = async (email, password) => login(email, password, true)

  const register = async (data) => {
    authGeneration.current += 1
    setActionLoading(true)
    try {
      await wakeServer()
      await initCsrf()
      const response = await authAPI.register(data)
      const newUser = response.data?.user
      if (!newUser) {
        throw new Error('Registration succeeded but no user data was returned.')
      }
      const verified = await fetchCurrentUser()
      if (!verified?.id) {
        throw new Error('Session could not be established. Please try again.')
      }
      markServerAwake()
      setApiStatus('ok')
      setAuthChecked(true)
      return response.data
    } finally {
      setActionLoading(false)
    }
  }

  const logout = async () => {
    authGeneration.current += 1
    setActionLoading(true)
    try {
      await initCsrf()
      await authAPI.logout()
    } catch {
      // Always clear client state even if server session already expired
    } finally {
      clearUser()
      setApiStatus('ok')
      setAuthChecked(true)
      setActionLoading(false)
    }
  }

  const isAdmin = user?.role === 'admin'
  const isStudent = user?.role === 'student'
  const isCoach = user?.role === 'coach'
  const isStaff = isCoach || isAdmin

  const retryBootstrap = useCallback(() => {
    bootstrapAuth({ silent: false, isRetry: true })
  }, [bootstrapAuth])

  return (
    <AuthContext.Provider value={{
      user,
      loading: !authChecked || actionLoading,
      initializing: !authChecked,
      authChecked,
      actionLoading,
      apiStatus,
      bootstrapMessage,
      retryBootstrap,
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