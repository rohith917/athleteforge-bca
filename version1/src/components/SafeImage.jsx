/**
 * Image with automatic fallback when remote URL fails (localhost / firewall safe).
 */
import { useEffect, useState } from 'react'
import { LOCAL_IMAGES } from '../utils/mediaUrls'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'

const REMOTE_TIMEOUT_MS = 4500

function isRemoteUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))
}

export default function SafeImage({
  src,
  fallback = LOCAL_IMAGES.portrait,
  alt = '',
  className = '',
  style,
  loading = 'lazy',
  preferLocal = false,
}) {
  const resolved = resolveMediaUrl(src) || src
  const primary = preferLocal && fallback ? fallback : (resolved || fallback)
  const [current, setCurrent] = useState(primary)
  const [stage, setStage] = useState(preferLocal ? 1 : 0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const nextPrimary = preferLocal && fallback ? fallback : (resolved || fallback)
    setCurrent(nextPrimary)
    setStage(preferLocal ? 1 : 0)
    setLoaded(false)
  }, [resolved, fallback, preferLocal])

  // Only remote URLs can hang indefinitely — local bundled images never need
  // a timeout, and a successful load (even a slow remote one) cancels this.
  useEffect(() => {
    if (preferLocal || !resolved || resolved === fallback || !isRemoteUrl(resolved)) return undefined

    let done = false
    const timer = setTimeout(() => {
      if (!done && !loaded) {
        setStage(1)
        setCurrent(fallback)
      }
    }, REMOTE_TIMEOUT_MS)

    return () => {
      done = true
      clearTimeout(timer)
    }
  }, [resolved, fallback, preferLocal, loaded])

  const handleLoad = () => setLoaded(true)

  const handleError = () => {
    if (stage === 0 && fallback && current !== fallback) {
      setStage(1)
      setCurrent(fallback)
      return
    }
    if (stage <= 1 && current !== LOCAL_IMAGES.portrait) {
      setStage(2)
      setCurrent(LOCAL_IMAGES.portrait)
    }
  }

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      decoding="async"
    />
  )
}