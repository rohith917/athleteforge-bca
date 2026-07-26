import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Briefcase, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const ROLES = [
  { id: 'coach', label: 'Coach', desc: 'Manage teams & athletes', icon: Briefcase, apiRole: 'coach' as const },
  { id: 'athlete', label: 'Athlete', desc: 'Track your performance', icon: Zap, apiRole: 'student' as const },
]

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', password_confirm: '', first_name: '', accountType: 'athlete',
  })
  const [error, setError] = useState('')
  const { register, actionLoading, getErrorMessage } = useAuth()
  const navigate = useNavigate()
  const selected = ROLES.find((r) => r.id === form.accountType) || ROLES[1]

  const handleSubmit = async (e: FormEvent) => {
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
    <AuthLayout>
      <h2 className="font-display text-3xl font-extrabold text-text">Create your account</h2>
      <p className="mt-2 font-body text-text-secondary">Sign up as a Coach or Athlete</p>

      {error && <p className="mt-4 font-body text-sm text-accent-hover">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <span className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">Register as</span>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon
              const active = form.accountType === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, accountType: r.id }))}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors',
                    active ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:border-border-strong',
                  )}
                >
                  <Icon className={active ? 'text-accent' : 'text-text-muted'} size={20} />
                  <strong className="font-body text-sm text-text">{r.label}</strong>
                  <small className="font-body text-xs text-text-muted">{r.desc}</small>
                </button>
              )
            })}
          </div>
        </div>

        <Input
          id="first_name"
          label="Full name"
          value={form.first_name}
          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          required
        />
        <Input
          id="email"
          type="email"
          label="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <Input
          id="password"
          type="password"
          label="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
          minLength={6}
        />
        <Input
          id="password_confirm"
          type="password"
          label="Confirm password"
          value={form.password_confirm}
          onChange={(e) => setForm((f) => ({ ...f, password_confirm: e.target.value }))}
          required
        />

        <Button type="submit" disabled={actionLoading} magnetic={false} className="mt-2">
          {actionLoading ? 'Creating...' : <><UserPlus size={18} /> Register as {selected.label}</>}
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-text-muted">
        Have an account? <Link to="/login" className="text-accent hover:text-accent-hover">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
