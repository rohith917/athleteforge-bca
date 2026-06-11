/**
 * Image with automatic fallback when remote URL fails (localhost / firewall safe).
 */
import { useState } from 'react'
import { LOCAL_IMAGES } from '../utils/mediaUrls'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'

export default function SafeImage({
  src,
  fallback = LOCAL_IMAGES.portrait,
  alt = '',
  className = '',
  style,
  loading = 'lazy',
}) {
  const [current, setCurrent] = useState(() => resolveMediaUrl(src) || src || fallback)
  const [stage, setStage] = useState(0)

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