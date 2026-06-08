import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authAPI } from '../services/api'
import { FaEnvelope, FaKey, FaArrowLeft } from 'react-icons/fa'
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
    setLoading(true)
    try {
      const res = await authAPI.forgotPassword({ email })
      setMessage(res.data.message)
      if (res.data.reset_token) setResetToken(res.data.reset_token)
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-luxury-page">
      <Link to="/login" className="auth-back-luxury"><FaArrowLeft /> Back</Link>
      <motion.div className="auth-luxury-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Logo size="lg" showTagline />
        <h2 className="login-title mt-3">Reset password</h2>
        {error && <div className="alert-custom alert-danger-custom">{error}</div>}
        {message && <div className="alert-custom" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label-custom">Email</label>
            <input type="email" className="form-control-custom" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-gold w-100" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Sending...' : <><FaKey /> Send reset link</>}
          </button>
        </form>
        {resetToken && (
          <p className="mt-3 text-center" style={{ fontSize: '0.82rem' }}>
            <Link to={`/reset-password?token=${resetToken}`} className="auth-link">Use reset token</Link>
          </p>
        )}
      </motion.div>
    </div>
  )
}