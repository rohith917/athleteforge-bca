import type { AxiosError } from 'axios'
import { getErrorMessage } from '@/services/api'
import type { ListResponse } from '@/types'

/** Normalize DRF paginated or plain array responses. */
export function parseListResponse<T>(data: ListResponse<T>): T[] {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}

export function getLoadErrorMessage(error: unknown, label = 'data'): string {
  const axErr = error as AxiosError
  if (!axErr?.response && axErr?.message?.includes('timed out')) {
    return 'Server is waking up — wait 30 seconds and tap Retry.'
  }
  if (!axErr?.response) {
    return 'Cannot reach API server. If using a split frontend, confirm the backend host is reachable.'
  }
  if (axErr?.response?.status === 401 || axErr?.response?.status === 403) {
    return 'Session expired — please sign in again.'
  }
  return getErrorMessage(error, `Failed to load ${label}.`)
}
