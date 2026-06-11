/**
 * Resolve Django /media/ and API image paths for Vite dev + production.
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (typeof window !== 'undefined') {
      try {
        const parsed = new URL(trimmed)
        const isLocalApi = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'
        const onVite = window.location.port === '5173' || window.location.port === '3000'
        if (isLocalApi && onVite && parsed.pathname.startsWith('/media/')) {
          return `${window.location.origin}${parsed.pathname}`
        }
      } catch {
        /* keep original */
      }
    }
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  return `/${trimmed.replace(/^\//, '')}`
}