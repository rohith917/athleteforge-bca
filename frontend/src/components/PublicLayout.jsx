/**
 * Public pages layout — top navbar on landing, login, register, etc.
 */
import PublicNavbar from './PublicNavbar'

export default function PublicLayout({ children }) {
  return (
    <div className="public-page-wrap">
      <PublicNavbar />
      {children}
    </div>
  )
}