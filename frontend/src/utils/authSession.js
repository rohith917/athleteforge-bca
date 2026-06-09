import { clearAuthTokens } from '../services/api'

export const AUTH_LOGOUT_KEY = 'af_logout_signal'
export const AUTH_SESSION_KEY = 'af_session_id'

export function clearAllClientAuth() {
  clearAuthTokens()
  try {
    sessionStorage.removeItem('af_csrf')
    sessionStorage.removeItem(AUTH_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function markNewSession(userId) {
  try {
    sessionStorage.setItem(AUTH_SESSION_KEY, String(userId || Date.now()))
  } catch {
    /* ignore */
  }
}

export function signalLogoutAllTabs() {
  try {
    localStorage.setItem(AUTH_LOGOUT_KEY, String(Date.now()))
    localStorage.removeItem(AUTH_LOGOUT_KEY)
  } catch {
    /* ignore */
  }
}