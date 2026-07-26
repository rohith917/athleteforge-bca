/**
 * API URL configuration — supports unified (athleteforge-bca) and split (athleteforge-frontend) deploys.
 */
export const PRODUCTION_BACKEND = 'https://athleteforge-bca.onrender.com'

export function isSplitFrontendHost(hostname = '') {
  return hostname === 'athleteforge-frontend.onrender.com'
}

export function isUnifiedProductionHost(hostname = '') {
  return hostname === 'athleteforge-bca.onrender.com'
}

export function resolveApiBase() {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (isSplitFrontendHost(hostname)) {
      return `${PRODUCTION_BACKEND}/api`
    }
    if (isUnifiedProductionHost(hostname) || hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api'
    }
    if (hostname.includes('onrender.com') || hostname.includes('railway.app') || hostname.includes('fly.dev')) {
      return '/api'
    }
  }

  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && !envUrl.includes('YOUR-BACKEND') && !envUrl.includes('athleteforge-api.onrender.com')) {
    return envUrl.replace(/\/$/, '')
  }
  return '/api'
}

export function getPublicBackendUrl() {
  if (typeof window !== 'undefined' && isSplitFrontendHost(window.location.hostname)) {
    return PRODUCTION_BACKEND
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return PRODUCTION_BACKEND
}