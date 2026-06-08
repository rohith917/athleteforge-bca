/**
 * Register — Coach / Athlete / Student
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  FaEnvelope, FaLock, FaUser, FaUserPlus, FaUserTie, FaUserGraduate,
  FaArrowLeft, FaRunning
} from 'react-icons/fa'
import Logo from '../components/Logo'

const ROLES = [
  { id: 'coach', label: 'Coach', desc: 'Manage teams', icon: FaUserTie, apiRole: 'coach' },
  { id: 'athlete', label: 'Athlete', desc: 'Track performance', icon: FaRunning, apiRole: 'student' },
  { id: 'student', label: 'Student', desc: 'Academy portal', icon: FaUserGraduate, apiRole: 'student' },
]

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', password_confirm: '', first_name: '', accountType: 'athlete',
  })
  const [error, setError] = useState('')
  const { register, actionLoading, getErrorMessage } = useAuth()
  const navigate = useNavigate()

  const selected = ROLES.find((r) => r.id === form.accountType) || ROLES[1]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register({
        email: form.email,
        password: form.password,
        password_confirm: form.password_confirm,
        first_name: form.first_name,
        last_name: '',
        role: selected.apiRole,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed.'))
    }
  }

  return (
    <div className="auth-luxury-page">
      <Link to="/" className="auth-back-luxury"><FaArrowLeft /> Home</Link>
      <motion.div className="auth-luxury-card" style={{ maxWidth: 460 }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Logo size="lg" showTagline />
        <h2 className="login-title mt-3">Create account</h2>
        <p className="login-subtitle">Choose your role</p>
        {error && <div className="alert-custom alert-danger-custom">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label-custom mb-2">Register as</label>
          <div className="role-select-trio mb-3">
            {ROLES.map((r) => (
              <div key={r.id} className={`role-card-trio ${form.accountType === r.id ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, accountType: r.id })} role="button" tabIndex={0}>
                <div className="role-icon-trio"><r.icon /></div>
                <strong>{r.label}</strong>
                <small>{r.desc}</small>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <label className="form-label-custom"><FaUser className="me-1" /> Full name</label>
            <input className="form-control-custom" value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label-custom"><FaEnvelope className="me-1" /> Email</label>
            <input type="email" className="form-control-custom" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label-custom"><FaLock className="me-1" /> Password</label>
            <input type="password" className="form-control-custom" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="mb-4">
            <label className="form-label-custom"><FaLock className="me-1" /> Confirm password</label>
            <input type="password" className="form-control-custom" value={form.password_confirm}
              onChange={(e) => setForm({ ...form, password_confirm: e.target.value })} required />
          </div>
          <button type="submit" className="btn-gold w-100" disabled={actionLoading} style={{ width: '100%' }}>
            {actionLoading ? 'Creating...' : <><FaUserPlus /> Register as {selected.label}</>}
          </button>
        </form>
        <p className="auth-footer">
          Have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}