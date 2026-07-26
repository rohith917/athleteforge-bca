import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import type { AxiosError } from 'axios'
import { authAPI } from '@/services/api'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

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
    const t = searchParams.get('token')
    if (t) setToken(t)
  }, [searchParams])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.resetPassword({ token, password, password_confirm: passwordConfirm })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const data = (err as AxiosError<{ token?: string[]; password?: string[] }>).response?.data
      setError(data?.token?.[0] || data?.password?.[0] || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-3xl font-extrabold text-text">New password</h2>
      <p className="mt-2 font-body text-text-secondary">Enter your reset token and a new password</p>

      {error && <p className="mt-4 font-body text-sm text-accent-hover">{error}</p>}
      {message && <p className="mt-4 font-body text-sm text-emerald-400">{message}</p>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Input
          id="token"
          label="Reset token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Input
          id="password_confirm"
          type="password"
          label="Confirm password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} magnetic={false} className="mt-2">
          {loading ? 'Saving...' : <><CheckCircle2 size={18} /> Reset password</>}
        </Button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-text-muted">
        Remembered it? <Link to="/login" className="text-accent hover:text-accent-hover">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
