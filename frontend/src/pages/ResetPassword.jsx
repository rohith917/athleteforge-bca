import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authAPI } from '../services/api'
import { FaLock, FaCheck, FaArrowLeft } from 'react-icons/fa'
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
    setLoading(true)
    try {
      const res = await authAPI.resetPassword({ token, password, password_confirm: passwordConfirm })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const d = err.response?.data
      setError(d?.token?.[0] || d?.password?.[0] || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-luxury-page">
      <Link to="/login" className="auth-back-luxury"><FaArrowLeft /> Back</Link>
      <motion.div className="auth-luxury-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Logo size="lg" showTagline />
        <h2 className="login-title mt-3">New password</h2>
        {error && <div className="alert-custom alert-danger-custom">{error}</div>}
        {message && <div className="alert-custom" style={{ background: 'rgba(34,197,94,0.08)', color: '#22C55E' }}>{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom">Reset token</label>
            <input className="form-control-custom" value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label-custom">New password</label>
            <input type="password" className="form-control-custom" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="mb-4">
            <label className="form-label-custom">Confirm password</label>
            <input type="password" className="form-control-custom" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn-gold w-100" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Saving...' : <><FaCheck /> Reset password</>}
          </button>
        </form>
      </motion.div>
    </div>
  )
}