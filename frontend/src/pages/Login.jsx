/**
 * Login — minimal luxury
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa'
import Logo from '../components/Logo'

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
      await login(identifier.trim(), password, identifier.includes('@'))
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

  return (
    <div className="auth-luxury-page">
      <Link to="/" className="auth-back-luxury"><FaArrowLeft /> Home</Link>
      <motion.div
        className="auth-luxury-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {user ? (
          <>
            <Logo size="lg" showTagline />
            <h2 className="login-title mt-3">Already signed in</h2>
            <p className="login-subtitle">Welcome back, {user.first_name || user.username}</p>
            <button type="button" className="btn-gold w-100 mb-3" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>
              <FaTachometerAlt /> Go to Dashboard
            </button>
            <button type="button" className="btn-outline-gold w-100" style={{ width: '100%' }} onClick={handleSwitchAccount} disabled={loading}>
              <FaSignOutAlt /> {loading ? 'Signing out...' : 'Use different account'}
            </button>
          </>
        ) : (
          <>
            <Logo size="lg" showTagline />
            <h2 className="login-title mt-3">Welcome back</h2>
            <p className="login-subtitle">Sign in to your account</p>
            {error && <div className="alert-custom alert-danger-custom">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label-custom">Email or username</label>
                <input type="text" className="form-control-custom" value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)} required autoComplete="username" />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Password</label>
                <input type="password" className="form-control-custom" value={password}
                  onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <button type="submit" className="btn-gold w-100" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : <><FaSignInAlt /> Sign In</>}
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
  )
}