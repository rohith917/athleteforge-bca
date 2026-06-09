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

const BOOTSTRAP_UI_MAX_MS = 8000

function isNotLoggedInError(err) {
  const status = err?.response?.status
  return status === 401 || status === 403
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState('waking')
  const [bootstrapMessage, setBootstrapMessage] = useState('Connecting to server...')

  const authGeneration = useRef(0)
  const userFromAction = useRef(false)

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

  const finishInitializing = useCallback(() => {
    setInitializing(false)
  }, [])

  const bootstrapAuth = useCallback(async ({ silent = false } = {}) => {
    const gen = ++authGeneration.current
    if (!silent) {
      setInitializing(true)
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
        userFromAction.current = false
      } catch (err) {
        if (gen !== authGeneration.current) return
        if (isNotLoggedInError(err)) {
          if (!userFromAction.current) clearUser()
          setApiStatus('ok')
          return
        }
        throw err
      }
      if (gen !== authGeneration.current) return
      setApiStatus('ok')
    } catch {
      if (gen !== authGeneration.current) return
      if (!userFromAction.current) clearUser()
      setApiStatus('error')
    } finally {
      if (gen === authGeneration.current && !silent) {
        finishInitializing()
      }
    }
  }, [clearUser, fetchCurrentUser, finishInitializing])

  useEffect(() => {
    bootstrapAuth()
  }, [bootstrapAuth])

  /** Never block the UI longer than BOOTSTRAP_UI_MAX_MS — fixes stuck "Checking session". */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initializing) finishInitializing()
    }, BOOTSTRAP_UI_MAX_MS)
    return () => clearTimeout(timer)
  }, [initializing, finishInitializing])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      userFromAction.current = false
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
      userFromAction.current = true
      setUser(loggedInUser)
      markServerAwake()
      setApiStatus('ok')
      finishInitializing()
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
      userFromAction.current = true
      setUser(newUser)
      markServerAwake()
      setApiStatus('ok')
      finishInitializing()
      await fetchCurrentUser()
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
      userFromAction.current = false
      clearUser()
      setApiStatus('ok')
      setActionLoading(false)
    }
  }

  const isAdmin = Boolean(user?.is_admin || user?.role === 'admin')
  const isStudent = user?.role === 'student'
  const isCoach = user?.role === 'coach'
  const isStaff = isCoach || isAdmin

  const retryBootstrap = useCallback(() => {
    userFromAction.current = Boolean(user)
    bootstrapAuth({ silent: false })
  }, [bootstrapAuth, user])

  return (
    <AuthContext.Provider value={{
      user,
      loading: initializing || actionLoading,
      initializing,
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