/**
 * API service layer — session auth with CSRF for same-origin cloud deploy.
 */
import axios from 'axios'

/** Resolve API base — same-origin when SPA is served by Django backend. */
function resolveApiBase() {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && !envUrl.includes('YOUR-BACKEND') && !envUrl.includes('athleteforge-api.onrender.com')) {
    return envUrl
  }
  return '/api'
}

const API_BASE = resolveApiBase()

const isLocalDev = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1')

const isCloudHost = !isLocalDev && typeof window !== 'undefined'
  && (window.location.hostname.includes('onrender.com')
    || window.location.hostname.includes('railway.app')
    || window.location.hostname.includes('fly.dev')
    || window.location.hostname.includes('koyeb.app'))

/** Cloud cold starts can take up to 60s on first request. */
const CLOUD_TIMEOUT = 90000
const DEFAULT_TIMEOUT = isCloudHost ? CLOUD_TIMEOUT : 12000

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT,
})

let serverAwake = isLocalDev || !isCloudHost

/** Ping health endpoint to wake sleeping Render instance before auth. */
export async function wakeServer() {
  if (serverAwake) return true
  try {
    await api.get('/health/', { timeout: CLOUD_TIMEOUT })
    serverAwake = true
    return true
  } catch {
    return false
  }
}

export function markServerAwake() {
  serverAwake = true
}

let csrfToken = ''
let onUnauthorized = null

function readCookieCsrf() {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function getCsrfToken() {
  return readCookieCsrf() || csrfToken || sessionStorage.getItem('af_csrf') || ''
}

export function setCsrfToken(token) {
  csrfToken = token || ''
  if (token) {
    sessionStorage.setItem('af_csrf', token)
  } else {
    sessionStorage.removeItem('af_csrf')
  }
}

export function clearAuthTokens() {
  csrfToken = ''
  try {
    sessionStorage.removeItem('af_csrf')
  } catch {
    /* ignore */
  }
}

let authenticating = false

export function setAuthenticating(value) {
  authenticating = Boolean(value)
}

export function isAuthenticating() {
  return authenticating
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export async function initCsrf() {
  try {
    const res = await api.get('/auth/csrf/', { timeout: DEFAULT_TIMEOUT })
    markServerAwake()
    const token = res.data?.csrfToken || ''
    setCsrfToken(token)
    return token
  } catch {
    const fallback = readCookieCsrf()
    if (fallback) setCsrfToken(fallback)
    return fallback
  }
}

/** Wake server, refresh CSRF, and confirm session cookie is valid. */
export async function ensureApiSession() {
  await wakeServer()
  await initCsrf()
  try {
    await authAPI.getUser()
    markServerAwake()
    return true
  } catch {
    return false
  }
}

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getCsrfToken()
    if (token) config.headers['X-CSRFToken'] = token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url || ''

    if (
      status === 403 &&
      !original?._csrfRetry &&
      !url.includes('/auth/csrf/')
    ) {
      original._csrfRetry = true
      await initCsrf()
      const token = getCsrfToken()
      if (token) {
        original.headers['X-CSRFToken'] = token
        return api.request(original)
      }
    }

    const method = (original?.method || 'get').toLowerCase()

    if (
      status === 401 &&
      !authenticating &&
      !original?._authRetry &&
      method === 'get' &&
      !url.includes('/auth/login/') &&
      !url.includes('/auth/register/') &&
      !url.includes('/auth/logout/') &&
      !url.includes('/auth/csrf/') &&
      !url.includes('/auth/user/')
    ) {
      original._authRetry = true
      await wakeServer()
      await initCsrf()
      try {
        await api.get('/auth/user/', { timeout: DEFAULT_TIMEOUT })
        return api.request(original)
      } catch {
        /* session truly expired — fall through */
      }
    }

    if (
      status === 401 &&
      !authenticating &&
      !url.includes('/auth/login/') &&
      !url.includes('/auth/register/') &&
      !url.includes('/auth/logout/') &&
      !url.includes('/auth/csrf/') &&
      !url.includes('/auth/user/')
    ) {
      onUnauthorized?.()
    }

    return Promise.reject(error)
  }
)

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'Server is taking too long to respond. Wait 30 seconds and try again (free tier cold start).'
    }
    if (error?.message?.toLowerCase().includes('network')) {
      return 'Cannot reach the server. Check your internet connection or wait for the API to wake up.'
    }
    return fallback
  }
  const data = error?.response?.data
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (data.error) return data.error
  if (data.detail) return data.detail
  if (data.message) return data.message
  const firstKey = Object.keys(data)[0]
  if (firstKey && Array.isArray(data[firstKey])) return data[firstKey][0]
  if (firstKey && typeof data[firstKey] === 'string') return data[firstKey]
  return fallback
}

// Auth API
export const authAPI = {
  getCsrf: () => api.get('/auth/csrf/'),
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  forgotPassword: (data) => api.post('/auth/forgot-password/', data),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  logout: () => api.post('/auth/logout/'),
  getUser: () => api.get('/auth/user/'),
}

// AI Insights API
export const aiAPI = {
  getInsights: (params) => api.get('/ai/insights/', { params }),
  getDemo: () => api.get('/ai/demo/'),
  getStatus: () => api.get('/ai/status/'),
  copilot: (data) => api.post('/ai/copilot/', data),
}

// Athletes API
export const athletesAPI = {
  getAll: (params) => api.get('/athletes/', { params }),
  getById: (id) => api.get(`/athletes/${id}/`),
  getProfile: (id) => api.get(`/athletes/${id}/profile/`),
  create: (data) => api.post('/athletes/', data),
  update: (id, data) => api.put(`/athletes/${id}/`, data),
  delete: (id) => api.delete(`/athletes/${id}/`),
}

// Performance API
export const performanceAPI = {
  getAll: (params) => api.get('/performance/', { params }),
  create: (data) => api.post('/performance/', data),
  update: (id, data) => api.put(`/performance/${id}/`, data),
  delete: (id) => api.delete(`/performance/${id}/`),
  getDashboard: (params) => api.get('/performance/dashboard/', { params }),
}

// Injuries API
export const injuriesAPI = {
  getAll: (params) => api.get('/injuries/', { params }),
  create: (data) => api.post('/injuries/', data),
  update: (id, data) => api.put(`/injuries/${id}/`, data),
  delete: (id) => api.delete(`/injuries/${id}/`),
  updateRecovery: (id, status) => api.patch(`/injuries/${id}/update_recovery/`, { recovery_status: status }),
}

// Competitions API
export const competitionsAPI = {
  getAll: () => api.get('/competitions/'),
  create: (data) => api.post('/competitions/', data),
  update: (id, data) => api.put(`/competitions/${id}/`, data),
  delete: (id) => api.delete(`/competitions/${id}/`),
  addResult: (id, data) => api.post(`/competitions/${id}/add_result/`, data),
  getMedals: () => api.get('/competitions/medals/'),
}

export const competitionResultsAPI = {
  getAll: (params) => api.get('/competition-results/', { params }),
  update: (id, data) => api.put(`/competition-results/${id}/`, data),
  delete: (id) => api.delete(`/competition-results/${id}/`),
}

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance/', { params }),
  create: (data) => api.post('/attendance/', data),
  bulkMark: (records) => api.post('/attendance/bulk_mark/', { records }),
  getReport: (params) => api.get('/attendance/report/', { params }),
}

// Weight Tracking API
export const weightAPI = {
  getAll: (params) => api.get('/weight-tracking/', { params }),
  create: (data) => api.post('/weight-tracking/', data),
  update: (id, data) => api.put(`/weight-tracking/${id}/`, data),
  delete: (id) => api.delete(`/weight-tracking/${id}/`),
  calculateBMI: (data) => api.post('/weight-tracking/calculate_bmi/', data),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: (params) => api.get('/admin/users/', { params }),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  createUser: (data) => api.post('/admin/users/', data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  deactivateUser: (id) => api.delete(`/admin/users/${id}/`),
}

// Reports API
export const reportsAPI = {
  downloadPDF: (type) => `${API_BASE}/reports/pdf/?type=${type}`,
  downloadExcel: (type) => `${API_BASE}/reports/excel/?type=${type}`,
}

export default api
