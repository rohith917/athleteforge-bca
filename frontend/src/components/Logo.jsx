/**
 * AthleteForge logo — minimal luxury
 */
export default function Logo({ size = 'md', showTagline = false, variant = 'default' }) {
  const shieldSize = size === 'lg' ? 48 : size === 'sm' ? 32 : 40
  const fontSize = size === 'lg' ? '1.35rem' : size === 'sm' ? '0.9rem' : '1.1rem'
  const isLight = variant === 'light'
  const shieldFill = isLight ? '#ff3d3d' : '#6d28d9'
  const shieldStroke = isLight ? '#ffffff' : '#a78bfa'

  return (
    <div className={`af-logo${isLight ? ' af-logo-light' : ''}`}>
      <div className="af-shield" style={{ width: shieldSize, height: shieldSize }}>
        <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 2L44 12V28C44 40 24 54 24 54C24 54 4 40 4 28V12L24 2Z" fill={shieldFill} stroke={shieldStroke} strokeWidth="1"/>
          <text x="24" y="34" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="Inter, sans-serif">AF</text>
        </svg>
      </div>
      <div className="af-brand-text">
        <span className={`af-brand-name logo-text-main${isLight ? ' text-white' : ''}`} style={{ fontSize, color: isLight ? '#fff' : undefined }}>AthleteForge</span>
        {showTagline && <span className="af-tagline">Track. Recover. Perform.</span>}
      </div>
    </div>
  )
}