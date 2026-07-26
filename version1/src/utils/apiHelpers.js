import { getErrorMessage } from '../services/api'

/** Normalize DRF paginated or plain array responses. */
export function parseListResponse(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

export function getLoadErrorMessage(error, label = 'data') {
  if (!error?.response && error?.message?.includes('timed out')) {
    return 'Server is waking up — wait 30 seconds and tap Retry.'
  }
  if (!error?.response) {
    return `Cannot reach API server. If using athleteforge-frontend.onrender.com, backend must be at athleteforge-bca.onrender.com.`
  }
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'Session expired — please sign in again.'
  }
  return getErrorMessage(error, `Failed to load ${label}.`)
}