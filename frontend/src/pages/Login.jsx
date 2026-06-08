/**
 * AthleteForge login — email + password with role-based redirect.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa'
import Logo from '../components/Logo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithEmail, user } = useAuth()
  const navigate = useNavigate()

  if (user) { navigate('/'); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Logo size="lg" showTagline />
        <h2 className="login-title mt-3">Welcome Back</h2>
        <p className="login-subtitle">Track. Recover. Perform.</p>

        {error && <div className="alert-custom alert-danger-custom">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom"><FaEnvelope className="me-1" /> Email</label>
            <input type="email" className="form-control-custom" value={email}
              onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
          </div>
          <div className="mb-4">
            <label className="form-label-custom"><FaLock className="me-1" /> Password</label>
            <input type="password" className="form-control-custom" value={password}
              onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
          </div>
          <button type="submit" className="btn-gold w-100 justify-content-center" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : <><FaSignInAlt /> Sign In to AthleteForge</>}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </p>

        <p className="auth-footer">
          New athlete? <Link to="/register" className="auth-link">Create account</Link>
        </p>

        <p className="text-center mt-3 mb-0" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Admin: <span style={{ color: 'var(--af-cyan)' }}>admin@athletetracking.com</span> / admin123<br />
          Coach: <span style={{ color: 'var(--af-cyan)' }}>coach@athleteforge.com</span> / coach123<br />
          Student: <span style={{ color: 'var(--af-cyan)' }}>rahul.sharma@email.com</span> / student123
        </p>
      </div>
    </div>
  )
}