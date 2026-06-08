/**
 * Public pages footer — landing, login, register.
 */
import TeamCredits from './TeamCredits'

export default function PublicFooter() {
  return (
    <footer className="site-footer">
      <TeamCredits />
      <span className="footer-copy">© {new Date().getFullYear()} AthleteForge. All rights reserved.</span>
    </footer>
  )
}