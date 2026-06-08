/**
 * Public site navbar — glass effect with scroll state
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function PublicNavbar() {
  const { user } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

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
    </motion.header>
  )
}