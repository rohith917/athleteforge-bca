/** Full-page redirect — hash routes on legacy static host, path routes on same-origin backend. */
export function redirectTo(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const useHash = window.location.hostname.includes('athleteforge-frontend.onrender.com')
  if (useHash) {
    const base = window.location.origin + window.location.pathname
    window.location.replace(`${base}#${normalized}`)
  } else {
    window.location.replace(window.location.origin + normalized)
  }
}