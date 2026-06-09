/**
 * Public site navbar — glass effect with scroll state
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function PublicNavbar() {
  const { user, authChecked } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const isAuthenticated = Boolean(authChecked && user)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className={`public-navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="landing-container public-navbar-inner">
        <Link to="/" className="text-decoration-none">
          <Logo size="sm" showTagline={false} />
        </Link>

        <nav className="public-nav-links public-nav-auth-group" aria-label="Main navigation">
          <Link
            to="/"
            className={`public-nav-home ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-gold btn-sm-public public-nav-dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`public-nav-login public-nav-signin ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`btn-gold btn-sm-public public-nav-signup ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  )
}