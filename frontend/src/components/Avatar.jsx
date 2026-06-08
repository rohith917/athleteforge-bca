/**
 * Profile avatar with fallback to generated image from name.
 */
export default function Avatar({ src, name = 'User', size = 'md', className = '' }) {
  const sizes = { sm: 32, md: 40, lg: 96 }
  const px = sizes[size] || sizes.md
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0a0e17&color=FFD700&size=${px * 2}&bold=true`

  return (
    <img
      src={src || fallback}
      alt={name}
      className={`user-avatar ${size === 'lg' ? 'user-avatar-lg' : ''} ${className}`}
      style={{ width: px, height: px }}
      onError={(e) => { e.target.src = fallback }}
    />
  )
}