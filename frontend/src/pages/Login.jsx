/**
 * Login — cinematic split-screen auth
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa'
import Logo from '../components/Logo'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { user, login, logout, actionLoading, getErrorMessage, bootstrapMessage } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath = location.state?.from?.pathname || '/dashboard'
  const prefill = location.state?.prefill

  useEffect(() => {
    if (prefill?.identifier) setIdentifier(prefill.identifier)
    if (prefill?.password) setPassword(prefill.password)
  }, [prefill?.identifier, prefill?.password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(identifier.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email/username or password.'))
    }
  }

  const handleSwitchAccount = async () => {
    setError('')
    try {
      await logout({ hardRedirect: false })
      setIdentifier('')
      setPassword('')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign out.'))
    }
  }

  const handleClearSession = async () => {
    setError('')
    try {
      await logout({ hardRedirect: false })
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.clear()
      localStorage.removeItem('af_logout_signal')
    } catch {
      /* ignore */
    }
    setIdentifier('admin')
    setPassword('admin123')
    setError('Session cleared. Press Sign In again.')
  }

  return (
    <div className="auth-split-page">
      <Link to="/" className="auth-back-link"><FaArrowLeft /> Home</Link>

      <div className="auth-split-visual">
        <div className="auth-split-visual-bg" aria-hidden="true" />
        <div className="auth-split-visual-overlay" aria-hidden="true" />
        <motion.div
          className="auth-split-visual-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>TRACK. <span>RECOVER.</span> PERFORM.</h1>
          <p>
            Sign in to access your coach command center or athlete performance hub —
            injuries, analytics, attendance, and AI insights in one place.
          </p>
          <div className="auth-split-stats">
            <div className="auth-split-stat"><strong>500+</strong><small>Athletes</small></div>
            <div className="auth-split-stat"><strong>95%</strong><small>Recovery</small></div>
            <div className="auth-split-stat"><strong>AI</strong><small>Insights</small></div>
          </div>
        </motion.div>
      </div>

      <div className="auth-split-form-side">
        <motion.div
          className="auth-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {user ? (
            <>
              <Logo size="lg" showTagline />
              <h2 className="login-title mt-3">Already signed in</h2>
              <p className="login-subtitle">Welcome back, {user.first_name || user.username}</p>
              {error && <div className="alert-custom alert-danger-custom">{error}</div>}
              <button type="button" className="btn-hero-primary w-100 mb-3" onClick={() => navigate(returnPath, { replace: true })}>
                <FaTachometerAlt /> Go to Dashboard
              </button>
              <button type="button" className="btn-hero-ghost w-100" onClick={handleSwitchAccount} disabled={actionLoading}>
                <FaSignOutAlt /> {actionLoading ? 'Signing out...' : 'Use different account'}
              </button>
            </>
          ) : (
            <>
              <Logo size="lg" showTagline />
              <h2 className="login-title mt-3">Welcome back</h2>
              <p className="login-subtitle">Sign in to your account</p>
              <div className="alert-custom mb-3" style={{
                background: 'rgba(255, 61, 61, 0.08)',
                border: '1px solid rgba(255, 61, 61, 0.25)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Demo accounts</strong><br />
                Admin: <code>admin</code> / <code>admin123</code><br />
                Coach: <code>coach</code> / <code>coach123</code>
              </div>
              {error && <div className="alert-custom alert-danger-custom">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label-custom">Email or username</label>
                  <input type="text" className="form-control-custom" value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)} required autoComplete="username" disabled={actionLoading} />
                </div>
                <div className="mb-4">
                  <label className="form-label-custom">Password</label>
                  <input type="password" className="form-control-custom" value={password}
                    onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" disabled={actionLoading} />
                </div>
                <button type="submit" className="btn-hero-primary w-100" disabled={actionLoading}>
                  {actionLoading ? (bootstrapMessage || 'Signing in...') : <><FaSignInAlt /> Sign In</>}
                </button>
                <button
                  type="button"
                  className="btn-hero-ghost w-100 mt-2"
                  onClick={handleClearSession}
                  disabled={actionLoading}
                >
                  Clear stuck session &amp; retry
                </button>
              </form>
              <p className="text-center mt-3 mb-0">
                <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
              </p>
              <p className="auth-footer">
                No account? <Link to="/register" className="auth-link">Create one</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}