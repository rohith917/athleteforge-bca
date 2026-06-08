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
        <span>BCA Final Year Project © {new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}