/**
 * AthleteForge logo — AF shield with gold accent + brand text.
 */
export default function Logo({ size = 'md', showTagline = false }) {
  const shieldSize = size === 'lg' ? 56 : size === 'sm' ? 36 : 44
  const fontSize = size === 'lg' ? '1.5rem' : size === 'sm' ? '0.85rem' : '1.1rem'

  return (
    <div className="af-logo">
      <div className="af-shield" style={{ width: shieldSize, height: shieldSize }}>
        <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 2L44 12V28C44 40 24 54 24 54C24 54 4 40 4 28V12L24 2Z" fill="url(#shieldGrad)" stroke="#FFD700" strokeWidth="1.5"/>
          <text x="24" y="34" textAnchor="middle" fill="#0a0e17" fontSize="16" fontWeight="800" fontFamily="Inter, sans-serif">AF</text>
          <defs>
            <linearGradient id="shieldGrad" x1="24" y1="2" x2="24" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFD700"/>
              <stop offset="1" stopColor="#C9A000"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="af-brand-text">
        <span className="af-brand-name" style={{ fontSize }}>ATHLETEFORGE</span>
        {showTagline && <span className="af-tagline">Track. Recover. Perform.</span>}
      </div>
    </div>
  )
}