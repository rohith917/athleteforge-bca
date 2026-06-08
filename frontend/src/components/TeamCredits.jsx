/**
 * Founder & co-founder — home page footer only.
 */
export default function TeamCredits({ className = '' }) {
  return (
    <div className={`site-credits ${className}`.trim()}>
      <p>Founder — <strong>Rohith Gowda V</strong></p>
      <p>Co-Founder — <strong>Prakruti</strong></p>
    </div>
  )
}