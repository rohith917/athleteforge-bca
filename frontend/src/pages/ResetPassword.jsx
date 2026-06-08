/**
 * Reset password with token from forgot-password flow.
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'
import { FaLock, FaCheck } from 'react-icons/fa'
import Logo from '../components/Logo'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchParams.get('token')) setToken(searchParams.get('token'))
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await authAPI.resetPassword({ token, password, password_confirm: passwordConfirm })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const data = err.response?.data
      setError(data?.token?.[0] || data?.password?.[0] || data?.password_confirm?.[0] || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Logo size="lg" showTagline />
        <h2 className="login-title mt-3">Reset Password</h2>
        <p className="login-subtitle">Enter your new password</p>

        {error && <div className="alert-custom alert-danger-custom">{error}</div>}
        {message && <div className="alert-custom" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--af-success)', border: '1px solid rgba(34,197,94,0.3)' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom">Reset Token</label>
            <input type="text" className="form-control-custom" value={token}
              onChange={(e) => setToken(e.target.value)} required placeholder="Paste reset token" />
          </div>
          <div className="mb-3">
            <label className="form-label-custom"><FaLock className="me-1" /> New Password</label>
            <input type="password" className="form-control-custom" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="mb-4">
            <label className="form-label-custom"><FaLock className="me-1" /> Confirm Password</label>
            <input type="password" className="form-control-custom" value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn-gold w-100 justify-content-center" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Resetting...' : <><FaCheck /> Reset Password</>}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login" className="auth-link">Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}