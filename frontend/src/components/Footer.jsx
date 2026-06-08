/**
 * Dashboard footer.
 */
import TeamCredits from './TeamCredits'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <span className="footer-brand">ATHLETEFORGE</span>
        <span className="footer-tag">Track. Recover. Perform.</span>
      </div>
      <TeamCredits className="footer-credits" />
      <p className="footer-copy-line">© {new Date().getFullYear()} AthleteForge</p>
    </footer>
  )
}