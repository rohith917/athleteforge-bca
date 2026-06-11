/**
 * Image with automatic fallback when remote URL fails (localhost / firewall safe).
 */
import { useEffect, useState } from 'react'
import { LOCAL_IMAGES } from '../utils/mediaUrls'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'

const REMOTE_TIMEOUT_MS = 4500

export default function SafeImage({
  src,
  fallback = LOCAL_IMAGES.portrait,
  alt = '',
  className = '',
  style,
  loading = 'lazy',
  preferLocal = import.meta.env.DEV,
}) {
  const resolved = resolveMediaUrl(src) || src
  const primary = preferLocal && fallback ? fallback : (resolved || fallback)
  const [current, setCurrent] = useState(primary)
  const [stage, setStage] = useState(preferLocal ? 1 : 0)

  useEffect(() => {
    const nextPrimary = preferLocal && fallback ? fallback : (resolved || fallback)
    setCurrent(nextPrimary)
    setStage(preferLocal ? 1 : 0)
  }, [resolved, fallback, preferLocal])

  useEffect(() => {
    if (preferLocal || !resolved || resolved === fallback) return undefined

    let done = false
    const timer = setTimeout(() => {
      if (!done) {
        setStage(1)
        setCurrent(fallback)
      }
    }, REMOTE_TIMEOUT_MS)

    return () => {
      done = true
      clearTimeout(timer)
    }
  }, [resolved, fallback, preferLocal])

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
      onError={handleError}
      decoding="async"
    />
  )
}