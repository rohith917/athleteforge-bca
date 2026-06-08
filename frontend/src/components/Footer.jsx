/**
 * AthleteForge footer.
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span className="footer-brand">ATHLETEFORGE</span>
        <span className="footer-tag">Track. Recover. Perform.</span>
        <span>·</span>
        <span className="footer-founder">Founder — Rohith Gowda V</span>
        <span>·</span>
        <span>© {new Date().getFullYear()} AthleteForge</span>
      </div>
    </footer>
  )
}