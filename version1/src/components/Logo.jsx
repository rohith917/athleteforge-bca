/**
 * AthleteForge wordmark — MDNT editorial (no shield icon)
 */
export default function Logo({ size = 'md', showTagline = false, variant = 'light' }) {
  const isLight = variant === 'light' || variant === 'default'
  const sizeClass = size === 'lg' ? 'af-logo-lg' : size === 'sm' ? 'af-logo-sm' : 'af-logo-md'

  return (
    <div className={`af-logo af-logo-wordmark ${sizeClass}${isLight ? ' af-logo-light' : ''}`}>
      <span className="af-brand-name logo-text-main" aria-label="AthleteForge">
        ATHLETE<span className="af-brand-accent">FORGE</span>
      </span>
      {showTagline && (
        <span className="af-tagline">TRACK · RECOVER · PERFORM</span>
      )}
    </div>
  )
}