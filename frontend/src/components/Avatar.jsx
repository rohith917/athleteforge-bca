/**
 * Profile avatar with fallback to generated image from name.
 */
import { resolveMediaUrl } from '../utils/resolveMediaUrl'
import { uiAvatarUrl } from '../utils/mediaUrls'

export default function Avatar({ src, name = 'User', size = 'md', className = '' }) {
  const sizes = { sm: 32, md: 40, lg: 96 }
  const px = sizes[size] || sizes.md
  const resolved = resolveMediaUrl(src)
  const fallback = uiAvatarUrl(name, px * 2)

  return (
    <img
      src={resolved || fallback}
      alt={name}
      className={`user-avatar ${size === 'lg' ? 'user-avatar-lg' : ''} ${className}`}
      style={{ width: px, height: px }}
      onError={(e) => { e.target.onerror = null; e.target.src = fallback }}
    />
  )
}