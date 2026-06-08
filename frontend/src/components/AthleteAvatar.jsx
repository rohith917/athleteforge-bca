/**
 * Athlete profile avatar with photo or initials fallback.
 */
import { useState } from 'react'
import { getAthletePhoto, getAthleteInitials } from '../utils/athleteImages'

export default function AthleteAvatar({ athlete, size = 48, className = '' }) {
  const [imgError, setImgError] = useState(false)
  const photo = getAthletePhoto(athlete)
  const initials = getAthleteInitials(athlete)

  if (imgError) {
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
      onError={() => setImgError(true)}
      loading="lazy"
    />
  )
}