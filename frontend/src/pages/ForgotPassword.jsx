/**
 * Forgot password — request reset token via email.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { FaEnvelope, FaKey } from 'react-icons/fa'
import Logo from '../components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setResetToken('')
    setLoading(true)
    try {
      const res = await authAPI.forgotPassword({ email })
      setMessage(res.data.message)
      if (res.data.reset_token) {
        setResetToken(res.data.reset_token)
      }
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Request failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Logo size="lg" showTagline />
        <h2 className="login-title mt-3">Forgot Password</h2>
        <p className="login-subtitle">We'll send reset instructions</p>

        {error && <div className="alert-custom alert-danger-custom">{error}</div>}
        {message && <div className="alert-custom" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--af-cyan)', border: '1px solid rgba(0,212,255,0.3)' }}>{message}</div>}

        {resetToken && (
          <div className="mb-3 p-3" style={{ background: 'var(--af-elevated)', borderRadius: '8px', fontSize: '0.82rem' }}>
            <strong>Demo reset token:</strong>
            <p className="mb-2 mt-1" style={{ wordBreak: 'break-all', color: 'var(--af-cyan)' }}>{resetToken}</p>
            <Link to={`/reset-password?token=${resetToken}`} className="auth-link">
              <FaKey className="me-1" /> Go to Reset Password
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label-custom"><FaEnvelope className="me-1" /> Email Address</label>
            <input type="email" className="form-control-custom" value={email}
              onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your registered email" />
          </div>
          <button type="submit" className="btn-gold w-100 justify-content-center" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login" className="auth-link">Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}