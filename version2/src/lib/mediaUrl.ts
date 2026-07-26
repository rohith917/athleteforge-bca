/** Resolve Django /media/ and API image paths for Vite dev + production. */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (typeof window !== 'undefined') {
      try {
        const parsed = new URL(trimmed)
        const isLocalApi = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost'
        const onVite = import.meta.env.DEV
        if (isLocalApi && onVite && parsed.pathname.startsWith('/media/')) {
          return `${window.location.origin}${parsed.pathname}`
        }
      } catch {
        /* keep original */
      }
    }
    return trimmed
  }

  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed.replace(/^\//, '')}`
}

export function uiAvatarUrl(name: string, size = 80): string {
  const n = encodeURIComponent(name || 'User')
  return `https://ui-avatars.com/api/?name=${n}&background=171717&color=d7263d&size=${size}&bold=true`
}
