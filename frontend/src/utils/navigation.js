/** Full-page redirect compatible with HashRouter on static hosts (Render). */
export function redirectTo(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = window.location.origin + window.location.pathname
  window.location.replace(`${base}#${normalized}`)
}