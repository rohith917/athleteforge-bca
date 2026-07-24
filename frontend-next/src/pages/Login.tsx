import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { user, login, logout, actionLoading, getErrorMessage, bootstrapMessage } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(identifier.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = getErrorMessage(err, 'Invalid email/username or password.')
      setError(
        msg.toLowerCase().includes('network') || msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('reach')
          ? `${msg} Wait 30-60 seconds for the server to wake up, then try again.`
          : msg,
      )
    }
  }

  const handleSwitchAccount = async () => {
    setError('')
    try {
      await logout({ hardRedirect: false })
      setIdentifier('')
      setPassword('')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign out.'))
    }
  }

  if (user) {
    return (
      <AuthLayout>
        <h2 className="font-display text-3xl font-extrabold text-text">Already signed in</h2>
        <p className="mt-2 font-body text-text-secondary">Welcome back, {user.first_name || user.username}</p>
        {error && <p className="mt-4 font-body text-sm text-accent-hover">{error}</p>}
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => navigate(returnPath, { replace: true })} magnetic={false}>
            <LayoutDashboard size={18} /> Go to Dashboard
          </Button>
          <Button variant="outline" onClick={handleSwitchAccount} disabled={actionLoading} magnetic={false}>
            <LogOut size={18} /> {actionLoading ? 'Signing out...' : 'Use different account'}
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-3xl font-extrabold text-text">Welcome back</h2>
      <p className="mt-2 font-body text-text-secondary">Sign in to your account</p>

      <div className="mt-6 rounded-xl border border-border-strong bg-accent-soft p-4 font-body text-xs leading-relaxed text-text-secondary">
        <strong className="text-text">Demo accounts</strong>
        <br />
        Admin: <code>admin</code> / <code>admin123</code>
        <br />
        Coach: <code>coach</code> / <code>coach123</code>
        <br />
        Student: <code>rahul.sharma@email.com</code> / <code>student123</code>
      </div>

      {error && <p className="mt-4 font-body text-sm text-accent-hover">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Input
          id="identifier"
          label="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          disabled={actionLoading}
        />
        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={actionLoading}
        />
        <Button type="submit" disabled={actionLoading} magnetic={false} className="mt-2">
          {actionLoading ? (bootstrapMessage || 'Signing in...') : <><LogIn size={18} /> Sign In</>}
        </Button>
      </form>

      <p className="mt-4 text-center">
        <Link to="/forgot-password" className="font-body text-sm text-text-secondary hover:text-accent">
          Forgot password?
        </Link>
      </p>
      <p className="mt-6 text-center font-body text-sm text-text-muted">
        No account? <Link to="/register" className="text-accent hover:text-accent-hover">Create one</Link>
      </p>
    </AuthLayout>
  )
}
