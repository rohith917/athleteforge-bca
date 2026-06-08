/**
 * API service layer - handles all HTTP requests to Django backend.
 * Uses session-based authentication with credentials.
 */
import axios from 'axios'

// Local dev: uses Vite proxy (/api). Production: set VITE_API_URL on Render.
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Get CSRF token from cookie for POST requests
function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : ''
}

api.interceptors.request.use((config) => {
  const token = getCsrfToken()
  if (token) config.headers['X-CSRFToken'] = token
  return config
})

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  getUser: () => api.get('/auth/user/'),
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

// Reports API
export const reportsAPI = {
  downloadPDF: (type) => `${API_BASE}/reports/pdf/?type=${type}`,
  downloadExcel: (type) => `${API_BASE}/reports/excel/?type=${type}`,
}

export default api