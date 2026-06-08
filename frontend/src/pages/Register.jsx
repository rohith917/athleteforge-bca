/**
 * Registration with Coach / Student role selection.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaEnvelope, FaLock, FaUser, FaUserPlus, FaUserTie, FaUserGraduate,
  FaArrowLeft, FaTachometerAlt, FaSignOutAlt
} from 'react-icons/fa'
import Logo from '../components/Logo'
import { FounderLine } from '../components/FounderCredit'

const emptyForm = {
  email: '', password: '', password_confirm: '', first_name: '', last_name: '', role: 'student',
}

export default function Register() {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, register, logout } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const setRole = (role) => setForm({ ...form, role })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
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
      <div className="login-page">
        <Link to="/" className="login-back-home"><FaArrowLeft /> Back to Home</Link>
        <div className="login-card">
          <Logo size="lg" showTagline />
          <h2 className="login-title mt-3">Already Signed In</h2>
          <p className="login-subtitle">Sign out to create a new account</p>
          <button
            type="button"
            className="btn-gold w-100 justify-content-center mb-3"
            style={{ width: '100%' }}
            onClick={() => navigate('/dashboard')}
          >
            <FaTachometerAlt /> Go to Dashboard
          </button>
          <button
            type="button"
            className="btn-outline-gold w-100 justify-content-center"
            style={{ width: '100%' }}
            onClick={handleSwitchAccount}
            disabled={loading}
          >
            <FaSignOutAlt /> {loading ? 'Signing out...' : 'Sign out & register new account'}
          </button>
          <p className="auth-footer mt-3">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <Link to="/" className="login-back-home"><FaArrowLeft /> Back to Home</Link>
      <div className="login-card" style={{ maxWidth: 500 }}>
        <Logo size="lg" showTagline />
        <h2 className="login-title mt-3">Create Account</h2>
        <p className="login-subtitle">Join AthleteForge</p>

        {error && <div className="alert-custom alert-danger-custom">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label-custom mb-2">Register As</label>
          <div className="role-select-group">
            <div
              className={`role-select-card ${form.role === 'coach' ? 'selected' : ''}`}
              onClick={() => setRole('coach')}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setRole('coach')}
            >
              <div className="role-icon"><FaUserTie /></div>
              <strong>Coach</strong>
              <small>Manage athletes & data</small>
            </div>
            <div
              className={`role-select-card ${form.role === 'student' ? 'selected' : ''}`}
              onClick={() => setRole('student')}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setRole('student')}
            >
              <div className="role-icon"><FaUserGraduate /></div>
              <strong>Student / Athlete</strong>
              <small>View your own records</small>
            </div>
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
            {loading ? 'Creating account...' : <><FaUserPlus /> Register as {form.role === 'coach' ? 'Coach' : 'Student'}</>}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
        <FounderLine className="auth-founder" />
      </div>
    </div>
  )
}