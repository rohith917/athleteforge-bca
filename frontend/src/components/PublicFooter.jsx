/**
 * Home page footer — MDNT editorial or classic
 */
import TeamCredits from './TeamCredits'

export default function PublicFooter({ mdnt = false }) {
  if (mdnt) {
    return (
      <footer className="landing-site-footer mdnt-footer">
        <div className="landing-site-footer-inner">
          <span className="footer-brand">ATHLETEFORGE</span>
          <span className="footer-tag">Track · Recover · Perform · AI Powered</span>
          <TeamCredits />
          <span className="footer-copy">© {new Date().getFullYear()} AthleteForge. All rights reserved.</span>
        </div>
      </footer>
    )
  }

  return (
    <footer className="landing-site-footer">
      <div className="landing-container landing-site-footer-inner">
        <span className="footer-brand">ATHLETEFORGE</span>
        <span className="footer-tag">Track. Recover. Perform.</span>
        <TeamCredits />
        <span className="footer-copy">© {new Date().getFullYear()} AthleteForge. All rights reserved.</span>
      </div>
    </footer>
  )
}