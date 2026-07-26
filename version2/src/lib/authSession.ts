import { clearAuthTokens, setAuthToken } from '@/services/api'
import type { AuthUser } from '@/types'

export const AUTH_LOGOUT_KEY = 'af_logout_signal'
export const AUTH_SESSION_KEY = 'af_session_id'
export const AUTH_USER_KEY = 'af_user_snapshot'

export function clearAllClientAuth(): void {
  clearAuthTokens()
  try {
    sessionStorage.removeItem('af_csrf')
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    sessionStorage.removeItem(AUTH_USER_KEY)
  } catch (err) {
    console.warn('[authSession] storage access failed:', err)
  }
}

export function markNewSession(userId?: number | string): void {
  try {
    sessionStorage.setItem(AUTH_SESSION_KEY, String(userId || Date.now()))
  } catch (err) {
    console.warn('[authSession] storage access failed:', err)
  }
}

export function setUserSnapshot(user: AuthUser | null): void {
  try {
    if (user?.id) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(AUTH_USER_KEY)
    }
  } catch (err) {
    console.warn('[authSession] storage access failed:', err)
  }
}

export function getUserSnapshot(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch (err) {
    console.warn('[authSession] failed to read user snapshot:', err)
    return null
  }
}

export function persistLoginPayload(data: { token?: string; user?: AuthUser; csrfToken?: string }): void {
  if (data?.token) setAuthToken(data.token)
  if (data?.user) setUserSnapshot(data.user)
  if (data?.csrfToken) {
    try {
      sessionStorage.setItem('af_csrf', data.csrfToken)
    } catch (err) {
      console.warn('[authSession] storage access failed:', err)
    }
  }
}

export function signalLogoutAllTabs(): void {
  try {
    localStorage.setItem(AUTH_LOGOUT_KEY, String(Date.now()))
    localStorage.removeItem(AUTH_LOGOUT_KEY)
  } catch (err) {
    console.warn('[authSession] storage access failed:', err)
  }
}
