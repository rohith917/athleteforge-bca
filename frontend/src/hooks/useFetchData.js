import { useState, useEffect, useCallback } from 'react'
import { ensureApiSession } from '../services/api'
import { getLoadErrorMessage } from '../utils/apiHelpers'

/**
 * Shared data loader with session check, error state, and retry.
 */
export function useFetchData(fetcher, deps = [], options = {}) {
  const {
    initialData = null,
    requireSession = true,
    sessionError = 'Session not verified — please sign in again.',
    fallbackError = 'Failed to load data.',
    enabled = true,
  } = options

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError('')
    try {
      if (requireSession) {
        const ok = await ensureApiSession()
        if (!ok) {
          setError(sessionError)
          setData(initialData)
          return
        }
      }
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(getLoadErrorMessage(err, fallbackError))
      setData(initialData)
    } finally {
      setLoading(false)
    }
  }, [enabled, requireSession, sessionError, fallbackError, initialData, ...deps])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload, setData }
}