/**
 * AthleteForge login — Dribbble-style split layout
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa'
import Logo from '../components/Logo'
import { scaleIn } from '../components/motion/Motion'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const useEmail = identifier.includes('@')
      await login(identifier.trim(), password, useEmail)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email/username or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchAccount = async () => {
    setLoading(true)
    try {
      await logout()
      setIdentifier('')
      setPassword('')
      setError('')
    } finally {
      setLoading(false)
    }
  }

  const formContent = user ? (
    <>
      <Logo size="lg" showTagline />
      <h2 className="login-title mt-3">Already Signed In</h2>
      <p className="login-subtitle">Welcome back, {user.first_name || user.username}</p>
      <div className="auth-session-banner">
        <span className={`role-badge role-${user.role}`}>{user.role}</span>
        <span>{user.email}</span>
      </div>
      <button type="button" className="btn-gold w-100 justify-content-center mb-3" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>
        <FaTachometerAlt /> Go to Dashboard
      </button>
      <button type="button" className="btn-outline-gold w-100 justify-content-center" style={{ width: '100%' }} onClick={handleSwitchAccount} disabled={loading}>
        <FaSignOutAlt /> {loading ? 'Signing out...' : 'Sign in as different user'}
      </button>
    </>
  ) : (
    <>
      <Logo size="lg" showTagline />
      <h2 className="login-title mt-3">Welcome Back</h2>
      <p className="login-subtitle">Track. Recover. Perform.</p>
      {error && <div className="alert-custom alert-danger-custom">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label-custom"><FaEnvelope className="me-1" /> Email or Username</label>
          <input
            type="text"
            className="form-control-custom"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            placeholder="you@email.com or username"
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label className="form-label-custom"><FaLock className="me-1" /> Password</label>
          <input
            type="password"
            className="form-control-custom"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn-gold w-100 justify-content-center" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Signing in...' : <><FaSignInAlt /> Sign In to AthleteForge</>}
        </button>
      </form>

      <p className="text-center mt-3 mb-0">
        <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
      </p>
      <p className="auth-footer">
        Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
      </p>
    </>
  )

  return (
    <div className="auth-split-page">
      <Link to="/" className="auth-back-link"><FaArrowLeft /> Back to Home</Link>

      <div className="auth-split-visual">
        <div className="auth-split-visual-bg" aria-hidden="true" />
        <div className="auth-split-visual-overlay" aria-hidden="true" />
        <motion.div
          className="auth-split-visual-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1>AthleteForge<br /><span>Track. Recover. Perform.</span></h1>
          <p>Professional sports performance platform for coaches, academies, and elite athletes.</p>
          <div className="auth-split-stats">
            <div className="auth-split-stat"><strong>120+</strong><small>Athletes</small></div>
            <div className="auth-split-stat"><strong>92%</strong><small>Recovery Rate</small></div>
            <div className="auth-split-stat"><strong>24/7</strong><small>Analytics</small></div>
          </div>
        </motion.div>
      </div>

      <div className="auth-split-form-side">
        <motion.div className="auth-form-card" initial="hidden" animate="visible" variants={scaleIn}>
          {formContent}
        </motion.div>
      </div>
    </div>
  )
}