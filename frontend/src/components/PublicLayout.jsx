/**
 * Public pages layout — top navbar on landing, login, register, etc.
 */
import PublicNavbar from './PublicNavbar'

export default function PublicLayout({ children, mdnt = false }) {
  return (
    <div className={`public-page-wrap${mdnt ? ' public-page-mdnt' : ''}`}>
      <PublicNavbar mdnt={mdnt} />
      {children}
    </div>
  )
}