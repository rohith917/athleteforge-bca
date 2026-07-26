/**
 * Authentication context — session bootstrap, login, logout, role state.
 * Ported from the legacy frontend's AuthContext.jsx, fully typed, same
 * Django session/CSRF/token hybrid auth flow.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { AxiosError } from 'axios'
import {
  authAPI, initCsrf, wakeServer, markServerAwake, resetServerAwake,
  setUnauthorizedHandler, getErrorMessage, setAuthenticating, setCsrfToken, getAuthToken,
  type LoginPayload,
} from '@/services/api'
import {
  clearAllClientAuth, markNewSession, signalLogoutAllTabs, persistLoginPayload,
  getUserSnapshot, setUserSnapshot, AUTH_LOGOUT_KEY,
} from '@/lib/authSession'
import type { AuthUser } from '@/types'

type ApiStatus = 'waking' | 'ok' | 'error'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  initializing: boolean
  authChecked: boolean
  actionLoading: boolean
  apiStatus: ApiStatus
  bootstrapMessage: string
  retryBootstrap: () => void
  login: (emailOrUsername: string, password: string) => Promise<LoginPayload>
  loginWithEmail: (email: string, password: string) => Promise<LoginPayload>
  register: (data: {
    email: string; password: string; password_confirm: string
    first_name: string; last_name?: string; role?: 'coach' | 'student'
  }) => Promise<LoginPayload>
  logout: (opts?: { hardRedirect?: boolean }) => Promise<void>
  checkAuth: () => Promise<AuthUser | null>
  isAdmin: boolean
  isStudent: boolean
  isCoach: boolean
  isStaff: boolean
  getErrorMessage: typeof getErrorMessage
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isNotLoggedInError(err: unknown): boolean {
  const status = (err as AxiosError)?.response?.status
  return status === 401 || status === 403
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus>('waking')
  const [bootstrapMessage, setBootstrapMessage] = useState('Connecting to server...')

  const authGeneration = useRef(0)

  const clearUser = useCallback(() => {
    setUser(null)
    clearAllClientAuth()
  }, [])

  const fetchCurrentUser = useCallback(async (): Promise<AuthUser> => {
    const response = await authAPI.getUser()
    setUser(response.data)
    setUserSnapshot(response.data)
    markNewSession(response.data?.id)
    markServerAwake()
    return response.data
  }, [])

  const bootstrapAuth = useCallback(async ({ silent = false }: { silent?: boolean; isRetry?: boolean } = {}) => {
    const gen = ++authGeneration.current
    if (!silent) {
      setBootstrapMessage('Waking server (first visit may take up to 60s)...')
    }
    setApiStatus('waking')

    try {
      await wakeServer()
      if (gen !== authGeneration.current) return

      setBootstrapMessage('Checking your session...')
      await initCsrf()
      if (gen !== authGeneration.current) return

      const snapshot = getUserSnapshot()
      if (getAuthToken() && snapshot?.id) {
        setUser(snapshot)
        markNewSession(snapshot.id)
      }

      try {
        await fetchCurrentUser()
      } catch (err) {
        if (gen !== authGeneration.current) return
        if (isNotLoggedInError(err)) {
          clearUser()
          setApiStatus('ok')
          return
        }
        if (getAuthToken() && snapshot?.id) {
          setUser(snapshot)
          setApiStatus('ok')
          return
        }
        throw err
      }
      if (gen !== authGeneration.current) return
      setApiStatus('ok')
    } catch (err) {
      if (gen !== authGeneration.current) return
      console.error('[Auth] Session bootstrap failed:', err)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearUser()
      setAuthChecked(true)
    })
    return () => setUnauthorizedHandler(null)
  }, [clearUser])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_LOGOUT_KEY) {
        clearUser()
        setAuthChecked(true)
        window.location.assign('/')
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [clearUser])

  const checkAuth = async (): Promise<AuthUser | null> => {
    try {
      await wakeServer()
      await initCsrf()
      return await fetchCurrentUser()
    } catch (err) {
      if (isNotLoggedInError(err)) {
        clearUser()
        return null
      }
      const snapshot = getUserSnapshot()
      if (getAuthToken() && snapshot?.id) {
        setUser(snapshot)
        return snapshot
      }
      clearUser()
      setApiStatus('error')
      return null
    }
  }

  const login = async (emailOrUsername: string, password: string): Promise<LoginPayload> => {
    authGeneration.current += 1
    setAuthenticating(true)
    setActionLoading(true)
    setBootstrapMessage('Signing in...')
    clearAllClientAuth()
    resetServerAwake()

    try {
      await wakeServer()
      await initCsrf()
      const id = emailOrUsername.trim()
      const payload: { password: string; email?: string; username?: string } = { password }
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

      persistLoginPayload(response.data)
      if (response.data?.csrfToken) {
        setCsrfToken(response.data.csrfToken)
      } else {
        await initCsrf()
      }

      setUser(loggedInUser)
      setUserSnapshot(loggedInUser)
      markNewSession(loggedInUser.id)

      try {
        const verified = await fetchCurrentUser()
        setUserSnapshot(verified)
        markServerAwake()
        setApiStatus('ok')
        setAuthChecked(true)
        return { ...response.data, user: verified }
      } catch (err) {
        console.warn('[Auth] Post-login verification failed, using login response user:', err)
        markServerAwake()
        setApiStatus('ok')
        setAuthChecked(true)
        return { ...response.data, user: loggedInUser }
      }
    } finally {
      setAuthenticating(false)
      setActionLoading(false)
    }
  }

  const loginWithEmail = (email: string, password: string) => login(email, password)

  const register: AuthContextValue['register'] = async (data) => {
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
      persistLoginPayload(response.data)
      if (response.data?.csrfToken) {
        setCsrfToken(response.data.csrfToken)
      } else {
        await initCsrf()
      }
      setUser(newUser)
      setUserSnapshot(newUser)
      markNewSession(newUser.id)
      try {
        const verified = await fetchCurrentUser()
        setUserSnapshot(verified)
      } catch (err) {
        console.warn('[Auth] Post-register verification failed, trusting register response:', err)
      }
      markServerAwake()
      setApiStatus('ok')
      setAuthChecked(true)
      return { ...response.data, user: newUser }
    } finally {
      setAuthenticating(false)
      setActionLoading(false)
    }
  }

  const logout = async ({ hardRedirect = false }: { hardRedirect?: boolean } = {}) => {
    authGeneration.current += 1
    setActionLoading(true)
    try {
      await initCsrf()
      await authAPI.logout()
    } catch (err) {
      console.warn('[Auth] Server logout call failed, clearing client state anyway:', err)
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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
