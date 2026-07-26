/**
 * Decorative dashboard image — does not alter layout/theme; overlays or thumbs only.
 */
import { useState } from 'react'

const FALLBACK =
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80'

export default function DashboardAccentImage({
  src,
  alt = '',
  variant = 'thumb',
  className = '',
}) {
  const [url, setUrl] = useState(src || FALLBACK)

  return (
    <img
      src={url}
      alt={alt}
      className={`af-dash-accent af-dash-accent--${variant}${className ? ` ${className}` : ''}`}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (url !== FALLBACK) setUrl(FALLBACK)
      }}
    />
  )
}