/**
 * Reliable image URLs — Unsplash with local SVG fallbacks (works offline on localhost).
 */
export const LOCAL_IMAGES = {
  hero: '/images/hero-track.svg',
  coach: '/images/hero-coach.svg',
  athlete: '/images/hero-athlete.svg',
  auth: '/images/hero-athlete.svg',
  track: '/images/sport-track.svg',
  football: '/images/sport-football.svg',
  swim: '/images/sport-swim.svg',
  basketball: '/images/sport-basketball.svg',
  cricket: '/images/sport-cricket.svg',
  portrait: '/images/athlete-portrait.svg',
}

/** Verified Unsplash sports photos (auto=format for reliability). */
export const REMOTE_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1920&q=80',
  coach: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?auto=format&fit=crop&w=1200&q=80',
  athlete: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  auth: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?auto=format&fit=crop&w=1200&q=80',
  track: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
  football: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
  swim: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  cricket: 'https://images.unsplash.com/photo-1531415074968-d40fc2b32908?auto=format&fit=crop&w=800&q=80',
  galleryTrack: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
  galleryFootball: 'https://images.unsplash.com/photo-1517649763961-0c62306601b7?auto=format&fit=crop&w=600&q=80',
  gallerySwim: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?auto=format&fit=crop&w=600&q=80',
  portrait: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?auto=format&fit=crop&w=400&h=400&fit=crop&crop=face',
}

export function getImagePair(key) {
  return {
    primary: REMOTE_IMAGES[key] || LOCAL_IMAGES[key] || LOCAL_IMAGES.portrait,
    fallback: LOCAL_IMAGES[key] || LOCAL_IMAGES.portrait,
  }
}

export function uiAvatarUrl(name, size = 80) {
  const n = encodeURIComponent(name || 'User')
  return `https://ui-avatars.com/api/?name=${n}&background=0a0a0a&color=b8ff3c&size=${size}&bold=true`
}