/**
 * Forgot password — Dribbble-style auth card
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authAPI } from '../services/api'
import { FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa'
import Logo from '../components/Logo'
import { scaleIn } from '../components/motion/Motion'

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
      if (res.data.reset_token) setResetToken(res.data.reset_token)
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Request failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split-page">
      <Link to="/login" className="auth-back-link"><FaArrowLeft /> Back to Login</Link>
      <div className="auth-split-form-side" style={{ gridColumn: '1 / -1' }}>
        <motion.div className="auth-form-card" initial="hidden" animate="visible" variants={scaleIn}>
          <Logo size="lg" showTagline />
          <h2 className="login-title mt-3">Reset Password</h2>
          <p className="login-subtitle">Enter your email to receive a reset link</p>

          {error && <div className="alert-custom alert-danger-custom">{error}</div>}
          {message && <div className="alert-custom" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label-custom"><FaEnvelope className="me-1" /> Email</label>
              <input type="email" className="form-control-custom" value={email}
                onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
            </div>
            <button type="submit" className="btn-gold w-100 justify-content-center" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending...' : <><FaKey /> Send Reset Link</>}
            </button>
          </form>

          {resetToken && (
            <p className="mt-3 text-center" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Dev token: <Link to={`/reset-password?token=${resetToken}`} className="auth-link">{resetToken.slice(0, 16)}...</Link>
            </p>
          )}

          <p className="auth-footer">
            Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}