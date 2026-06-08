/**
 * Public site navbar — landing, login, register pages.
 */
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function PublicNavbar() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <header className="public-navbar">
      <div className="public-navbar-inner">
        <Link to="/" className="text-decoration-none">
          <Logo size="sm" showTagline={false} />
        </Link>

        <nav className="public-nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          {user ? (
            <Link to="/dashboard" className="btn-gold btn-sm-public">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Sign In</Link>
              <Link to="/register" className="btn-gold btn-sm-public">Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}