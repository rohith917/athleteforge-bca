/**
 * AthleteForge login page — dark premium sports theme.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa'
import Logo from '../components/Logo'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) { navigate('/'); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.')
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
            <label className="form-label-custom"><FaUser className="me-1" /> Username</label>
            <input type="text" className="form-control-custom" value={username}
              onChange={(e) => setUsername(e.target.value)} required placeholder="Enter username" />
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

        <p className="text-center mt-4 mb-0" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Demo: <span style={{ color: 'var(--af-gold)' }}>admin</span> / <span style={{ color: 'var(--af-gold)' }}>admin123</span>
        </p>
      </div>
    </div>
  )
}