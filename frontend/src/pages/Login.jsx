/**
 * Login — session-based auth with redirect after success.
 */
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft, FaTachometerAlt, FaSignOutAlt } from 'react-icons/fa'
import Logo from '../components/Logo'
import PublicLayout from '../components/PublicLayout'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { user, login, logout, actionLoading, getErrorMessage, bootstrapMessage } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const returnPath = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const result = await login(identifier.trim(), password, identifier.includes('@'))
      const role = result?.user?.role
      const dest = role === 'admin' || role === 'coach' || role === 'student'
        ? '/dashboard'
        : returnPath
      navigate(dest, { replace: true })
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
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign out. Please try again.'))
    }
  }

  const handleGoDashboard = () => {
    navigate(returnPath, { replace: true })
  }

  return (
    <PublicLayout>
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
            {error && <div className="alert-custom alert-danger-custom">{error}</div>}
            <button
              type="button"
              className="btn-gold w-100 mb-3"
              style={{ width: '100%' }}
              onClick={handleGoDashboard}
            >
              <FaTachometerAlt /> Go to Dashboard
            </button>
            <button
              type="button"
              className="btn-outline-gold w-100"
              style={{ width: '100%' }}
              onClick={handleSwitchAccount}
              disabled={actionLoading}
            >
              <FaSignOutAlt /> {actionLoading ? 'Signing out...' : 'Use different account'}
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
                <input
                  type="text"
                  className="form-control-custom"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  disabled={actionLoading}
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Password</label>
                <input
                  type="password"
                  className="form-control-custom"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={actionLoading}
                />
              </div>
              <button
                type="submit"
                className="btn-gold w-100"
                disabled={actionLoading}
                style={{ width: '100%' }}
              >
                {actionLoading ? (bootstrapMessage || 'Signing in...') : <><FaSignInAlt /> Sign In</>}
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
    </PublicLayout>
  )
}