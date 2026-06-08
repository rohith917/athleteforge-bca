/**
 * AthleteForge login — redirects to dashboard after auth.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft } from 'react-icons/fa'
import Logo from '../components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithEmail } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
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
            <label className="form-label-custom"><FaEnvelope className="me-1" /> Email</label>
            <input type="email" className="form-control-custom" value={email}
              onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" autoComplete="email" />
          </div>
          <div className="mb-4">
            <label className="form-label-custom"><FaLock className="me-1" /> Password</label>
            <input type="password" className="form-control-custom" value={password}
              onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" autoComplete="current-password" />
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
      </div>
    </div>
  )
}