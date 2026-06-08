/**
 * Student registration — email + password with athlete auto-link.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaEnvelope, FaLock, FaUser, FaUserPlus } from 'react-icons/fa'
import Logo from '../components/Logo'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', password_confirm: '', first_name: '', last_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  if (user) { navigate('/'); return null }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      setError(data?.email?.[0] || data?.password?.[0] || data?.password_confirm?.[0] || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Logo size="lg" showTagline />
        <h2 className="login-title mt-3">Create Account</h2>
        <p className="login-subtitle">Join as Student / Athlete</p>

        {error && <div className="alert-custom alert-danger-custom">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label-custom"><FaUser className="me-1" /> First Name</label>
            <input type="text" name="first_name" className="form-control-custom" value={form.first_name}
              onChange={handleChange} required placeholder="Your first name" />
          </div>
          <div className="mb-3">
            <label className="form-label-custom">Last Name</label>
            <input type="text" name="last_name" className="form-control-custom" value={form.last_name}
              onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="mb-3">
            <label className="form-label-custom"><FaEnvelope className="me-1" /> Email</label>
            <input type="email" name="email" className="form-control-custom" value={form.email}
              onChange={handleChange} required placeholder="you@email.com" />
          </div>
          <div className="mb-3">
            <label className="form-label-custom"><FaLock className="me-1" /> Password</label>
            <input type="password" name="password" className="form-control-custom" value={form.password}
              onChange={handleChange} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div className="mb-4">
            <label className="form-label-custom"><FaLock className="me-1" /> Confirm Password</label>
            <input type="password" name="password_confirm" className="form-control-custom" value={form.password_confirm}
              onChange={handleChange} required placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn-gold w-100 justify-content-center" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account...' : <><FaUserPlus /> Register</>}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}