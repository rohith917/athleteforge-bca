/**
 * High-quality athlete profile placeholder images (Unsplash sports portraits).
 * Maps athlete id to a consistent photo for list and detail views.
 */
const ATHLETE_PHOTOS = [
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1568602471122-7835931e4f82?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
]

export function getAthletePhoto(athlete) {
  if (!athlete) return ATHLETE_PHOTOS[0]
  const id = athlete.id || 0
  const name = `${athlete.first_name || ''}${athlete.last_name || ''}`
  const index = name.length ? (id + name.charCodeAt(0)) % ATHLETE_PHOTOS.length : id % ATHLETE_PHOTOS.length
  return ATHLETE_PHOTOS[index]
}

export function getAthleteInitials(athlete) {
  if (!athlete) return 'AF'
  const f = athlete.first_name?.[0] || ''
  const l = athlete.last_name?.[0] || ''
  return (f + l).toUpperCase() || 'A'
}