/**
 * Athlete profile images — remote with local SVG fallback per athlete.
 */
import { REMOTE_IMAGES, LOCAL_IMAGES } from './mediaUrls'

const ATHLETE_PHOTOS = [
  { remote: REMOTE_IMAGES.portrait, local: LOCAL_IMAGES.portrait },
  { remote: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&w=400&h=400&fit=crop&crop=face', local: LOCAL_IMAGES.portrait },
  { remote: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&w=400&h=400&fit=crop&crop=face', local: LOCAL_IMAGES.portrait },
  { remote: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&w=400&h=400&fit=crop&crop=face', local: LOCAL_IMAGES.portrait },
  { remote: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&w=400&h=400&fit=crop&crop=face', local: LOCAL_IMAGES.portrait },
  { remote: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&w=400&h=400&fit=crop&crop=face', local: LOCAL_IMAGES.portrait },
  { remote: 'https://images.unsplash.com/photo-1568602471122-7835931e4f82?auto=format&w=400&h=400&fit=crop&crop=face', local: LOCAL_IMAGES.portrait },
  { remote: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&w=400&h=400&fit=crop&crop=face', local: LOCAL_IMAGES.portrait },
]

export function getAthletePhoto(athlete) {
  if (!athlete) return ATHLETE_PHOTOS[0].remote
  if (athlete.photo || athlete.avatar_url) {
    return athlete.photo || athlete.avatar_url
  }
  const id = athlete.id || 0
  const name = `${athlete.first_name || ''}${athlete.last_name || ''}`
  const index = name.length ? (id + name.charCodeAt(0)) % ATHLETE_PHOTOS.length : id % ATHLETE_PHOTOS.length
  return ATHLETE_PHOTOS[index].remote
}

export function getAthletePhotoFallback(athlete) {
  if (!athlete) return LOCAL_IMAGES.portrait
  const id = athlete.id || 0
  const index = id % ATHLETE_PHOTOS.length
  return ATHLETE_PHOTOS[index].local
}

export function getAthleteInitials(athlete) {
  if (!athlete) return 'AF'
  const f = athlete.first_name?.[0] || athlete.full_name?.[0] || ''
  const l = athlete.last_name?.[0] || athlete.full_name?.split(' ')?.[1]?.[0] || ''
  return (f + l).toUpperCase() || 'A'
}