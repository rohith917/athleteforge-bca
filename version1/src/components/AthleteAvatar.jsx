/**
 * Athlete profile avatar with photo or initials fallback.
 */
import { useState } from 'react'
import { getAthletePhoto, getAthletePhotoFallback, getAthleteInitials } from '../utils/athleteImages'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'

export default function AthleteAvatar({ athlete, size = 48, className = '' }) {
  const [imgError, setImgError] = useState(false)
  const remote = resolveMediaUrl(getAthletePhoto(athlete)) || getAthletePhoto(athlete)
  const fallback = getAthletePhotoFallback(athlete)
  const photo = imgError ? fallback : remote
  const initials = getAthleteInitials(athlete)

  const handleError = () => {
    if (!imgError) setImgError(true)
  }

  if (imgError && !fallback) {
    return (
      <div className={`athlete-avatar athlete-avatar-fallback ${className}`} style={{ width: size, height: size, fontSize: size * 0.35 }}>
        {initials}
      </div>
    )
  }

  return (
    <img
      src={photo}
      alt={athlete?.full_name || athlete?.first_name || 'Athlete'}
      className={`athlete-avatar ${className}`}
      style={{ width: size, height: size }}
      onError={handleError}
      loading="lazy"
    />
  )
}