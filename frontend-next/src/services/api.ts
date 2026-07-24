/**
 * API service layer — session auth with CSRF.
 * Works on unified deploy (athleteforge-bca) and split frontend (athleteforge-frontend).
 * Ported from the legacy frontend's services/api.js — same endpoints, same retry/
 * cold-start behavior, now fully typed.
 */
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { resolveApiBase, getPublicBackendUrl } from '@/config/apiConfig'
import type {
  AuthUser, Athlete, AthleteListItem, Performance, Injury, Competition, CompetitionResult,
  Attendance, WeightTracking, DashboardStats, LeaderboardResponse, Goal, Announcement,
  NotificationsResponse, AdminUser, AttendanceReport,
  Sport, CourseCategory, CourseListItem, CourseDetail, LessonDetail, Enrollment, Certificate,
  LearningSummary, QuizSubmitResult, ResearchSummaryItem,
  Organization, OrgRole, OrganizationMembership,
  TrainingProgramListItem, TrainingProgramDetail, ProgramDayItem, ProgramBlockItem, ProgramExerciseItem, BlockType,
} from '@/types'

const API_BASE = resolveApiBase()

const isLocalDev = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const isCloudHost = !isLocalDev && typeof window !== 'undefined'
  && (window.location.hostname.includes('onrender.com')
    || window.location.hostname.includes('railway.app')
    || window.location.hostname.includes('fly.dev')
    || window.location.hostname.includes('koyeb.app'))

const isSplitFrontend = typeof window !== 'undefined'
  && window.location.hostname === 'athleteforge-frontend.onrender.com'

export const CLOUD_TIMEOUT = 90000
const LOCAL_TIMEOUT = 60000
const DEFAULT_TIMEOUT = isCloudHost ? CLOUD_TIMEOUT : LOCAL_TIMEOUT

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT,
})

let serverAwake = isLocalDev

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getApiBase(): string {
  return API_BASE
}

export function getBackendOrigin(): string {
  return getPublicBackendUrl()
}

/** Ping health endpoint to wake sleeping Render instance before auth. */
export async function wakeServer(): Promise<boolean> {
  if (serverAwake && !isSplitFrontend) return true
  try {
    await api.get('/health/', { timeout: CLOUD_TIMEOUT })
    serverAwake = true
    return true
  } catch {
    return false
  }
}

export function markServerAwake(): void {
  serverAwake = true
}

export function resetServerAwake(): void {
  serverAwake = false
}

let csrfToken = ''
let onUnauthorized: (() => void) | null = null

function readCookieCsrf(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function getCsrfToken(): string {
  return readCookieCsrf() || csrfToken || sessionStorage.getItem('af_csrf') || ''
}

export function setCsrfToken(token: string): void {
  csrfToken = token || ''
  if (token) {
    sessionStorage.setItem('af_csrf', token)
  } else {
    sessionStorage.removeItem('af_csrf')
  }
}

const AUTH_TOKEN_KEY = 'af_token'

export function getAuthToken(): string {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setAuthToken(token: string): void {
  try {
    if (token) sessionStorage.setItem(AUTH_TOKEN_KEY, token)
    else sessionStorage.removeItem(AUTH_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function clearAuthTokens(): void {
  csrfToken = ''
  setAuthToken('')
  try {
    sessionStorage.removeItem('af_csrf')
  } catch {
    /* ignore */
  }
}

let authenticating = false

export function setAuthenticating(value: boolean): void {
  authenticating = Boolean(value)
}

export function isAuthenticating(): boolean {
  return authenticating
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

export async function initCsrf(): Promise<string> {
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

/** Run an authenticated API call with wake + CSRF + retries (split-frontend safe). */
export async function withApiReady<T>(
  requestFn: () => Promise<T>,
  { retries = 5 }: { retries?: number } = {},
): Promise<T> {
  await wakeServer()
  let lastError: unknown
  for (let attempt = 0; attempt < retries; attempt += 1) {
    await initCsrf()
    try {
      const result = await requestFn()
      markServerAwake()
      return result
    } catch (err) {
      lastError = err
      const axErr = err as AxiosError
      const status = axErr?.response?.status
      const retryable = !axErr?.response
        || status === 401
        || status === 403
        || axErr?.code === 'ECONNABORTED'
      if (retryable && attempt < retries - 1) {
        resetServerAwake()
        await wakeServer()
        await sleep(900 + attempt * 1100)
        continue
      }
      throw err
    }
  }
  throw lastError
}

/** Wake server, refresh CSRF, and confirm session (user endpoint or dashboard probe). */
export async function ensureApiSession(retries = 8): Promise<boolean> {
  await wakeServer()
  if (getAuthToken()) {
    try {
      await initCsrf()
      await authAPI.getUser()
      markServerAwake()
      return true
    } catch {
      /* fall through to retry loop */
    }
  }
  for (let attempt = 0; attempt < retries; attempt += 1) {
    await initCsrf()
    try {
      await authAPI.getUser()
      markServerAwake()
      return true
    } catch (err) {
      const axErr = err as AxiosError
      const status = axErr?.response?.status
      if (isSplitFrontend || isCloudHost) {
        try {
          await api.get('/dashboard/stats/', { timeout: DEFAULT_TIMEOUT })
          markServerAwake()
          return true
        } catch (probeErr) {
          const probeStatus = (probeErr as AxiosError)?.response?.status
          if (probeStatus && probeStatus !== 401 && probeStatus !== 403) {
            if (attempt < retries - 1) {
              resetServerAwake()
              await wakeServer()
              await sleep(1000 * (attempt + 1))
              continue
            }
          }
        }
      }
      if (status === 401 || status === 403) {
        if (attempt < retries - 1) await sleep(800 * (attempt + 1))
        continue
      }
      if (attempt < retries - 1) {
        resetServerAwake()
        await wakeServer()
        await sleep(1200 * (attempt + 1))
        continue
      }
    }
  }
  return false
}

/** Download PDF/Excel with session cookies (works cross-origin). */
export async function downloadReport(type: string, format: 'pdf' | 'excel' = 'pdf'): Promise<void> {
  await ensureApiSession()
  await initCsrf()
  const path = format === 'pdf' ? `/reports/pdf/?type=${type}` : `/reports/excel/?type=${type}`
  const res = await api.get(path, {
    responseType: 'blob',
    timeout: CLOUD_TIMEOUT,
  })
  const ext = format === 'pdf' ? 'pdf' : 'xlsx'
  const blob = new Blob([res.data], {
    type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${type}_${format === 'pdf' ? 'report' : 'export'}.${ext}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()
  const apiToken = getAuthToken()
  if (apiToken) {
    config.headers.Authorization = `Token ${apiToken}`
  }
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getCsrfToken()
    if (token) config.headers['X-CSRFToken'] = token
  }
  return config
})

interface RetryableConfig extends AxiosRequestConfig {
  _csrfRetry?: boolean
  _authRetry?: boolean
  url?: string
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig
    const status = error.response?.status
    const url = original?.url || ''

    if (status === 403 && !original?._csrfRetry && !url.includes('/auth/csrf/')) {
      original._csrfRetry = true
      await initCsrf()
      const token = getCsrfToken()
      if (token) {
        original.headers = original.headers ?? {}
        ;(original.headers as Record<string, string>)['X-CSRFToken'] = token
        return api.request(original)
      }
    }

    const method = (original?.method || 'get').toLowerCase()

    if (
      status === 401 && !authenticating && !original?._authRetry && method === 'get' && getAuthToken()
      && !url.includes('/auth/login/') && !url.includes('/auth/register/')
      && !url.includes('/auth/logout/') && !url.includes('/auth/csrf/') && !url.includes('/auth/user/')
    ) {
      original._authRetry = true
      resetServerAwake()
      await wakeServer()
      await initCsrf()
      return api.request(original)
    }

    if (
      status === 401 && !authenticating
      && !url.includes('/auth/login/') && !url.includes('/auth/register/')
      && !url.includes('/auth/logout/') && !url.includes('/auth/csrf/') && !url.includes('/auth/user/')
    ) {
      if (!getAuthToken()) onUnauthorized?.()
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const axErr = error as AxiosError<Record<string, unknown>>
  if (!axErr?.response) {
    if (axErr?.code === 'ECONNABORTED') {
      return 'Server is taking too long to respond. Wait 30 seconds and try again (free tier cold start).'
    }
    if (axErr?.message?.toLowerCase().includes('network')) {
      return `Cannot reach API at ${API_BASE}. Check internet or wait for cloud server to wake up.`
    }
    return fallback
  }
  const data = axErr?.response?.data
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (typeof data.error === 'string') return data.error
  if (typeof data.detail === 'string') return data.detail
  if (typeof data.message === 'string') return data.message
  const firstKey = Object.keys(data)[0]
  const firstVal = firstKey ? data[firstKey] : undefined
  if (Array.isArray(firstVal)) return String(firstVal[0])
  if (typeof firstVal === 'string') return firstVal
  return fallback
}

export interface LoginPayload {
  user?: AuthUser
  token?: string
  csrfToken?: string
}

export const authAPI = {
  getCsrf: () => api.get('/auth/csrf/'),
  login: (credentials: { username?: string; email?: string; password: string }) =>
    api.post<LoginPayload>('/auth/login/', credentials),
  register: (data: { email: string; password: string; password_confirm: string; first_name: string; last_name?: string; role?: 'coach' | 'student' }) =>
    api.post<LoginPayload>('/auth/register/', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password/', data),
  resetPassword: (data: { token: string; password: string; password_confirm: string }) => api.post('/auth/reset-password/', data),
  logout: () => api.post('/auth/logout/'),
  getUser: () => api.get<AuthUser>('/auth/user/'),
}

export const aiAPI = {
  getInsights: (params?: Record<string, unknown>) => api.get('/ai/insights/', { params }),
  getDemo: () => api.get('/ai/demo/'),
  getStatus: () => api.get('/ai/status/'),
  copilot: (data: { message: string; athlete_id?: number }) => api.post('/ai/copilot/', data),
}

export const athletesAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<AthleteListItem[]>('/athletes/', { params }),
  getById: (id: number) => api.get<Athlete>(`/athletes/${id}/`),
  getProfile: (id: number) => api.get(`/athletes/${id}/profile/`),
  create: (data: Partial<Athlete>) => api.post<Athlete>('/athletes/', data),
  update: (id: number, data: Partial<Athlete>) => api.put<Athlete>(`/athletes/${id}/`, data),
  delete: (id: number) => api.delete(`/athletes/${id}/`),
}

export const performanceAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<Performance[]>('/performance/', { params }),
  create: (data: Partial<Performance>) => api.post<Performance>('/performance/', data),
  update: (id: number, data: Partial<Performance>) => api.put<Performance>(`/performance/${id}/`, data),
  delete: (id: number) => api.delete(`/performance/${id}/`),
  getDashboard: (params?: Record<string, unknown>) => api.get('/performance/dashboard/', { params }),
}

export const injuriesAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<Injury[]>('/injuries/', { params }),
  create: (data: Partial<Injury>) => api.post<Injury>('/injuries/', data),
  update: (id: number, data: Partial<Injury>) => api.put<Injury>(`/injuries/${id}/`, data),
  delete: (id: number) => api.delete(`/injuries/${id}/`),
  updateRecovery: (id: number, status: string) => api.patch<Injury>(`/injuries/${id}/update_recovery/`, { recovery_status: status }),
}

export const competitionsAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<Competition[]>('/competitions/', { params }),
  create: (data: Partial<Competition>) => api.post<Competition>('/competitions/', data),
  update: (id: number, data: Partial<Competition>) => api.put<Competition>(`/competitions/${id}/`, data),
  delete: (id: number) => api.delete(`/competitions/${id}/`),
  addResult: (id: number, data: Partial<CompetitionResult>) => api.post<CompetitionResult>(`/competitions/${id}/add_result/`, data),
  getMedals: () => api.get<{ gold: number; silver: number; bronze: number; total: number }>('/competitions/medals/'),
}

export const competitionResultsAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<CompetitionResult[]>('/competition-results/', { params }),
  update: (id: number, data: Partial<CompetitionResult>) => api.put<CompetitionResult>(`/competition-results/${id}/`, data),
  delete: (id: number) => api.delete(`/competition-results/${id}/`),
}

export const attendanceAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<Attendance[]>('/attendance/', { params }),
  create: (data: Partial<Attendance>) => api.post<Attendance>('/attendance/', data),
  bulkMark: (records: Partial<Attendance>[]) => api.post('/attendance/bulk_mark/', { records }),
  getReport: (params?: Record<string, unknown>) => api.get<AttendanceReport>('/attendance/report/', { params }),
}

export const weightAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<WeightTracking[]>('/weight-tracking/', { params }),
  create: (data: Partial<WeightTracking>) => api.post<WeightTracking>('/weight-tracking/', data),
  update: (id: number, data: Partial<WeightTracking>) => api.put<WeightTracking>(`/weight-tracking/${id}/`, data),
  delete: (id: number) => api.delete(`/weight-tracking/${id}/`),
  calculateBMI: (data: { weight_kg: number; height_cm: number }) => api.post('/weight-tracking/calculate_bmi/', data),
}

export const dashboardAPI = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats/'),
}

export const leaderboardAPI = {
  get: (params?: Record<string, unknown>) => api.get<LeaderboardResponse>('/leaderboard/', { params }),
}

export const goalsAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<Goal[]>('/goals/', { params }),
  create: (data: Partial<Goal>) => api.post<Goal>('/goals/', data),
  update: (id: number, data: Partial<Goal>) => api.put<Goal>(`/goals/${id}/`, data),
  delete: (id: number) => api.delete(`/goals/${id}/`),
}

export const announcementsAPI = {
  getAll: () => api.get<Announcement[]>('/announcements/'),
  create: (data: Partial<Announcement>) => api.post<Announcement>('/announcements/', data),
  delete: (id: number) => api.delete(`/announcements/${id}/`),
}

export const notificationsAPI = {
  getAll: () => api.get<NotificationsResponse>('/notifications/'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: (params?: Record<string, unknown>) => api.get<AdminUser[]>('/admin/users/', { params }),
  getUser: (id: number) => api.get<AdminUser>(`/admin/users/${id}/`),
  createUser: (data: Record<string, unknown>) => api.post<AdminUser>('/admin/users/', data),
  updateUser: (id: number, data: Record<string, unknown>) => api.patch<AdminUser>(`/admin/users/${id}/`, data),
  deactivateUser: (id: number) => api.delete(`/admin/users/${id}/`),
}

export interface ContactInquiryPayload {
  name: string
  email: string
  organization?: string
  message: string
}

export const contactAPI = {
  submit: (data: ContactInquiryPayload) => api.post('/contact/', data),
}

export const reportsAPI = {
  downloadPDF: (type: string) => `${API_BASE}/reports/pdf/?type=${type}`,
  downloadExcel: (type: string) => `${API_BASE}/reports/excel/?type=${type}`,
}

export const academyAPI = {
  getSports: () => api.get<Sport[]>('/academy/sports/'),
  getCategories: (params?: Record<string, unknown>) => api.get<CourseCategory[]>('/academy/categories/', { params }),
  getCourses: (params?: Record<string, unknown>) => api.get<CourseListItem[]>('/academy/courses/', { params }),
  getCourse: (slug: string) => api.get<CourseDetail>(`/academy/courses/${slug}/`),
  enroll: (slug: string) => api.post<Enrollment>(`/academy/courses/${slug}/enroll/`),
  getLesson: (slug: string) => api.get<LessonDetail>(`/academy/lessons/${slug}/`),
  completeLesson: (slug: string) => api.post<{ lesson_completed: boolean; course_progress_percent: number; course_completed: boolean }>(`/academy/lessons/${slug}/complete/`),
  bookmarkLesson: (slug: string) => api.post<{ is_bookmarked: boolean }>(`/academy/lessons/${slug}/bookmark/`),
  submitQuiz: (slug: string, answers: Record<string, number>) =>
    api.post<QuizSubmitResult>(`/academy/lessons/${slug}/submit_quiz/`, { answers }),
  getEnrollments: () => api.get<Enrollment[]>('/academy/enrollments/'),
  getCertificates: () => api.get<Certificate[]>('/academy/certificates/'),
  getLearningSummary: () => api.get<LearningSummary>('/academy/learning-summary/'),
  getResearch: (params?: Record<string, unknown>) => api.get<ResearchSummaryItem[]>('/academy/research/', { params }),

  getOrganizations: () => api.get<Organization[]>('/academy/organizations/'),
  createOrganization: (data: Partial<Organization>) => api.post<Organization>('/academy/organizations/', data),
  updateOrganization: (id: number, data: Partial<Organization>) => api.patch<Organization>(`/academy/organizations/${id}/`, data),

  getRoles: (params?: Record<string, unknown>) => api.get<OrgRole[]>('/academy/roles/', { params }),
  createRole: (data: Partial<OrgRole> & { permission_ids?: number[] }) => api.post<OrgRole>('/academy/roles/', data),

  getMemberships: (params?: Record<string, unknown>) => api.get<OrganizationMembership[]>('/academy/memberships/', { params }),
  createMembership: (data: { user: number; organization: number; role: number; is_primary?: boolean }) =>
    api.post<OrganizationMembership>('/academy/memberships/', data),
  updateMembership: (id: number, data: Partial<OrganizationMembership>) =>
    api.patch<OrganizationMembership>(`/academy/memberships/${id}/`, data),
  deleteMembership: (id: number) => api.delete(`/academy/memberships/${id}/`),
}

export const trainingAPI = {
  getPrograms: (params?: Record<string, unknown>) => api.get<TrainingProgramListItem[]>('/training/programs/', { params }),
  getProgram: (id: number) => api.get<TrainingProgramDetail>(`/training/programs/${id}/`),
  createProgram: (data: { name: string; athlete: number; sport?: string; start_date?: string; end_date?: string; notes?: string }) =>
    api.post<TrainingProgramListItem>('/training/programs/', data),
  updateProgram: (id: number, data: Partial<TrainingProgramListItem>) =>
    api.patch<TrainingProgramListItem>(`/training/programs/${id}/`, data),
  deleteProgram: (id: number) => api.delete(`/training/programs/${id}/`),
  addDay: (programId: number, data: { date: string; label?: string }) =>
    api.post<ProgramDayItem>(`/training/programs/${programId}/add_day/`, data),
  deleteDay: (id: number) => api.delete(`/training/days/${id}/`),

  createBlock: (data: { day: number; block_type: BlockType; title?: string; notes?: string }) =>
    api.post<ProgramBlockItem>('/training/blocks/', data),
  deleteBlock: (id: number) => api.delete(`/training/blocks/${id}/`),
  reorderBlocks: (order: number[]) => api.post('/training/blocks/reorder/', { order }),

  createExercise: (data: { block: number; name: string; sets?: number; reps?: string; load?: string; rest_seconds?: number; tempo?: string; notes?: string }) =>
    api.post<ProgramExerciseItem>('/training/exercises/', data),
  updateExercise: (id: number, data: Partial<ProgramExerciseItem>) =>
    api.patch<ProgramExerciseItem>(`/training/exercises/${id}/`, data),
  deleteExercise: (id: number) => api.delete(`/training/exercises/${id}/`),
  reorderExercises: (order: number[]) => api.post('/training/exercises/reorder/', { order }),
  completeExercise: (id: number) => api.post<{ is_completed: boolean }>(`/training/exercises/${id}/complete/`),
}

export default api
