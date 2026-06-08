/**
 * AthleteForge login — email or username + password.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa'
import Logo from '../components/Logo'
import { FounderLine } from '../components/FounderCredit'

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

  if (user) {
    return (
      <div className="login-page">
        <Link to="/" className="login-back-home"><FaArrowLeft /> Back to Home</Link>
        <div className="login-card">
          <Logo size="lg" showTagline />
          <h2 className="login-title mt-3">Already Signed In</h2>
          <p className="login-subtitle">
            Welcome back, {user.first_name || user.username}
          </p>
          <div className="auth-session-banner">
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
            <span>{user.email}</span>
          </div>
          <button
            type="button"
            className="btn-gold w-100 justify-content-center mb-3"
            style={{ width: '100%' }}
            onClick={() => navigate('/dashboard')}
          >
            <FaTachometerAlt /> Go to Dashboard
          </button>
          <button
            type="button"
            className="btn-outline-gold w-100 justify-content-center"
            style={{ width: '100%' }}
            onClick={handleSwitchAccount}
            disabled={loading}
          >
            <FaSignOutAlt /> {loading ? 'Signing out...' : 'Sign in as different user'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <Link to="/" className="login-back-home"><FaArrowLeft /> Back to Home</Link>
      <div className="login-card">
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
        <FounderLine className="auth-founder" />
      </div>
    </div>
  )
}