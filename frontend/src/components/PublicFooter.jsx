/**
 * Home page footer — founder credits shown once at the bottom.
 */
import TeamCredits from './TeamCredits'

export default function PublicFooter() {
  return (
    <footer className="landing-site-footer">
      <div className="landing-site-footer-inner">
        <span className="footer-brand">ATHLETEFORGE</span>
        <span className="footer-tag">Track. Recover. Perform.</span>
        <TeamCredits />
        <span className="footer-copy">© {new Date().getFullYear()} AthleteForge. All rights reserved.</span>
      </div>
    </footer>
  )
}