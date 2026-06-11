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
  setAuthenticating,
  setCsrfToken,
} from '../services/api'
import {
  clearAllClientAuth,
  markNewSession,
  signalLogoutAllTabs,
  AUTH_LOGOUT_KEY,
} from '../utils/authSession'

const AuthContext = createContext(null)

function isNotLoggedInError(err) {
  const status = err?.response?.status
  return status === 401 || status === 403
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
    clearAllClientAuth()
  }, [])

  const fetchCurrentUser = useCallback(async () => {
    const response = await authAPI.getUser()
    setUser(response.data)
    markNewSession(response.data?.id)
    markServerAwake()
    return response.data
  }, [])

  const verifySession = useCallback(async (fallbackUser, retries = 6) => {
    for (let attempt = 0; attempt < retries; attempt += 1) {
      try {
        await initCsrf()
        const verified = await fetchCurrentUser()
        if (verified?.id) return verified
      } catch (err) {
        if (!isNotLoggedInError(err)) throw err
        if (attempt < retries - 1) await sleep(500 * (attempt + 1))
      }
    }
    if (fallbackUser?.id) {
      setUser(fallbackUser)
      markNewSession(fallbackUser.id)
      return fallbackUser
    }
    throw new Error('Session could not be established. Clear cookies and try again.')
  }, [fetchCurrentUser])

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
      setAuthChecked(true)
    })
    return () => setUnauthorizedHandler(null)
  }, [clearUser])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === AUTH_LOGOUT_KEY) {
        clearUser()
        setAuthChecked(true)
        window.location.assign('/')
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
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

  const login = async (emailOrUsername, password) => {
    authGeneration.current += 1
    setAuthenticating(true)
    setActionLoading(true)
    setBootstrapMessage('Signing in...')
    clearAllClientAuth()

    try {
      await wakeServer()
      await initCsrf()
      const id = emailOrUsername.trim()
      const payload = { password }
      if (id.includes('@')) {
        payload.email = id
        payload.username = id.split('@')[0]
      } else {
        payload.username = id
      }

      const response = await authAPI.login(payload)
      const loggedInUser = response.data?.user
      if (!loggedInUser?.id) {
        throw new Error('Login succeeded but no user data was returned.')
      }

      if (response.data?.csrfToken) {
        setCsrfToken(response.data.csrfToken)
      } else {
        await initCsrf()
      }

      setUser(loggedInUser)
      markNewSession(loggedInUser.id)
      const verified = await verifySession(loggedInUser)
      markServerAwake()
      setApiStatus('ok')
      setAuthChecked(true)
      return { ...response.data, user: verified }
    } finally {
      setAuthenticating(false)
      setActionLoading(false)
    }
  }

  const loginWithEmail = async (email, password) => login(email, password)

  const register = async (data) => {
    authGeneration.current += 1
    setAuthenticating(true)
    setActionLoading(true)
    clearAllClientAuth()

    try {
      await wakeServer()
      await initCsrf()
      const response = await authAPI.register(data)
      const newUser = response.data?.user
      if (!newUser?.id) {
        throw new Error('Registration succeeded but no user data was returned.')
      }
      if (response.data?.csrfToken) {
        setCsrfToken(response.data.csrfToken)
      } else {
        await initCsrf()
      }
      setUser(newUser)
      markNewSession(newUser.id)
      const verified = await verifySession(newUser)
      markServerAwake()
      setApiStatus('ok')
      setAuthChecked(true)
      return { ...response.data, user: verified }
    } finally {
      setAuthenticating(false)
      setActionLoading(false)
    }
  }

  const logout = async ({ hardRedirect = false } = {}) => {
    authGeneration.current += 1
    setActionLoading(true)
    try {
      await initCsrf()
      await authAPI.logout()
    } catch {
      /* always clear client state */
    } finally {
      clearUser()
      signalLogoutAllTabs()
      setApiStatus('ok')
      setAuthChecked(true)
      setActionLoading(false)
      if (hardRedirect) {
        window.location.assign('/')
      }
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