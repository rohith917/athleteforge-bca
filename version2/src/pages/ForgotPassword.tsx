import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import type { AxiosError } from 'axios'
import { authAPI } from '@/services/api'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await authAPI.forgotPassword({ email })
      setMessage(res.data.message)
      if (res.data.reset_token) setResetToken(res.data.reset_token)
    } catch (err) {
      const data = (err as AxiosError<{ email?: string[] }>).response?.data
      setError(data?.email?.[0] || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-3xl font-extrabold text-text">Reset password</h2>
      <p className="mt-2 font-body text-text-secondary">We'll send you a reset link</p>

      {error && <p className="mt-4 font-body text-sm text-accent-hover">{error}</p>}
      {message && <p className="mt-4 font-body text-sm text-emerald-400">{message}</p>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} magnetic={false} className="mt-2">
          {loading ? 'Sending...' : <><KeyRound size={18} /> Send reset link</>}
        </Button>
      </form>

      {resetToken && (
        <p className="mt-4 text-center font-body text-sm">
          <Link to={`/reset-password?token=${resetToken}`} className="text-accent hover:text-accent-hover">
            Use reset token
          </Link>
        </p>
      )}

      <p className="mt-6 text-center font-body text-sm text-text-muted">
        Remembered it? <Link to="/login" className="text-accent hover:text-accent-hover">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
