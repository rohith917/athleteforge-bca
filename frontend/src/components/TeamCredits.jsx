/**
 * Founder & co-founder — shown once at the bottom of each page footer.
 */
export default function TeamCredits({ className = '' }) {
  return (
    <p className={`site-credits ${className}`.trim()}>
      <span>Founder — <strong>Rohith Gowda V</strong></span>
      <span className="site-credits-sep">·</span>
      <span>Co-Founder — <strong>Prakruti</strong></span>
    </p>
  )
}