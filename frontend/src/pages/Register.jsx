/**
 * Registration — Coach / Athlete / Student role selection
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  FaEnvelope, FaLock, FaUser, FaUserPlus, FaUserTie, FaUserGraduate,
  FaArrowLeft, FaTachometerAlt, FaSignOutAlt, FaRunning
} from 'react-icons/fa'
import Logo from '../components/Logo'
import { scaleIn } from '../components/motion/Motion'

const ROLES = [
  { id: 'coach', label: 'Coach', desc: 'Manage teams & data', icon: FaUserTie, apiRole: 'coach' },
  { id: 'athlete', label: 'Athlete', desc: 'Track performance', icon: FaRunning, apiRole: 'student' },
  { id: 'student', label: 'Student', desc: 'Academy portal', icon: FaUserGraduate, apiRole: 'student' },
]

const emptyForm = {
  email: '', password: '', password_confirm: '', first_name: '', last_name: '', accountType: 'athlete',
}

export default function Register() {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, register, logout } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const setAccountType = (id) => setForm({ ...form, accountType: id })

  const selectedRole = ROLES.find((r) => r.id === form.accountType) || ROLES[1]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        email: form.email,
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.first_name,
        last_name: form.last_name || '',
        role: selectedRole.apiRole,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const data = err.response?.data
      setError(data?.email?.[0] || data?.password?.[0] || data?.role?.[0] || data?.password_confirm?.[0] || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchAccount = async () => {
    setLoading(true)
    try {
      await logout()
      setForm(emptyForm)
      setError('')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <div className="auth-split-page">
        <Link to="/" className="auth-back-link"><FaArrowLeft /> Back to Home</Link>
        <div className="auth-split-form-side" style={{ gridColumn: '1 / -1' }}>
          <motion.div className="auth-form-card" initial="hidden" animate="visible" variants={scaleIn}>
            <Logo size="lg" showTagline />
            <h2 className="login-title mt-3">Already Signed In</h2>
            <p className="login-subtitle">Sign out to create a new account</p>
            <button type="button" className="btn-gold w-100 justify-content-center mb-3" style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>
              <FaTachometerAlt /> Go to Dashboard
            </button>
            <button type="button" className="btn-outline-gold w-100 justify-content-center" style={{ width: '100%' }} onClick={handleSwitchAccount} disabled={loading}>
              <FaSignOutAlt /> {loading ? 'Signing out...' : 'Sign out & register new account'}
            </button>
            <p className="auth-footer mt-3">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-split-page">
      <Link to="/" className="auth-back-link"><FaArrowLeft /> Back to Home</Link>

      <div className="auth-split-visual">
        <div className="auth-split-visual-bg" aria-hidden="true" />
        <div className="auth-split-visual-overlay" aria-hidden="true" />
        <motion.div
          className="auth-split-visual-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Join <span>AthleteForge</span></h1>
          <p>Create your account and start tracking performance, recovery, and competition readiness.</p>
          <div className="auth-split-stats">
            <div className="auth-split-stat"><strong>Free</strong><small>To Start</small></div>
            <div className="auth-split-stat"><strong>3</strong><small>Role Types</small></div>
            <div className="auth-split-stat"><strong>Pro</strong><small>Analytics</small></div>
          </div>
        </motion.div>
      </div>

      <div className="auth-split-form-side">
        <motion.div className="auth-form-card" style={{ maxWidth: 480 }} initial="hidden" animate="visible" variants={scaleIn}>
          <Logo size="lg" showTagline />
          <h2 className="login-title mt-3">Create Account</h2>
          <p className="login-subtitle">Choose your role</p>

          {error && <div className="alert-custom alert-danger-custom">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="form-label-custom mb-2">Register As</label>
            <div className="role-select-trio">
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  className={`role-card-trio ${form.accountType === r.id ? 'selected' : ''}`}
                  onClick={() => setAccountType(r.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setAccountType(r.id)}
                >
                  <div className="role-icon-trio"><r.icon /></div>
                  <strong>{r.label}</strong>
                  <small>{r.desc}</small>
                </div>
              ))}
            </div>

            <div className="mb-3">
              <label className="form-label-custom"><FaUser className="me-1" /> Full Name</label>
              <input type="text" name="first_name" className="form-control-custom" value={form.first_name}
                onChange={handleChange} required placeholder="Your full name" />
            </div>
            <div className="mb-3">
              <label className="form-label-custom"><FaEnvelope className="me-1" /> Email</label>
              <input type="email" name="email" className="form-control-custom" value={form.email}
                onChange={handleChange} required placeholder="you@email.com" autoComplete="email" />
            </div>
            <div className="mb-3">
              <label className="form-label-custom"><FaLock className="me-1" /> Password</label>
              <input type="password" name="password" className="form-control-custom" value={form.password}
                onChange={handleChange} required minLength={6} placeholder="Min 6 characters" autoComplete="new-password" />
            </div>
            <div className="mb-4">
              <label className="form-label-custom"><FaLock className="me-1" /> Confirm Password</label>
              <input type="password" name="password_confirm" className="form-control-custom" value={form.password_confirm}
                onChange={handleChange} required placeholder="Repeat password" autoComplete="new-password" />
            </div>
            <button type="submit" className="btn-gold w-100 justify-content-center" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating account...' : <><FaUserPlus /> Register as {selectedRole.label}</>}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}