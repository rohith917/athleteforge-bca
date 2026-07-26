import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FullScreenLoader } from '@/components/ui/Spinner'

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, authChecked, bootstrapMessage, retryBootstrap, actionLoading } = useAuth()
  const location = useLocation()

  if (!authChecked || actionLoading) {
    return <FullScreenLoader message={bootstrapMessage || 'Checking your session...'} onRetry={retryBootstrap} />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, authChecked, actionLoading } = useAuth()
  const location = useLocation()

  if (!authChecked || actionLoading) {
    return <FullScreenLoader message="Loading..." />
  }

  if (user) {
    const state = location.state as { from?: { pathname?: string } } | null
    const dest = state?.from?.pathname || '/dashboard'
    return <Navigate to={dest} replace />
  }

  return <>{children}</>
}

export function StaffRoute({ children }: { children: ReactNode }) {
  const { user, authChecked, isStaff } = useAuth()
  const location = useLocation()

  if (!authChecked) return <FullScreenLoader message="Checking your session..." />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isStaff) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, authChecked, isAdmin } = useAuth()
  const location = useLocation()

  if (!authChecked) return <FullScreenLoader message="Checking your session..." />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export function CoachRoute({ children }: { children: ReactNode }) {
  const { user, authChecked, isCoach, isAdmin } = useAuth()
  const location = useLocation()

  if (!authChecked) return <FullScreenLoader message="Checking your session..." />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isCoach && !isAdmin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export function FallbackRoute() {
  const { user, authChecked } = useAuth()

  if (!authChecked) return <Navigate to="/" replace />
  return <Navigate to={user ? '/dashboard' : '/'} replace />
}
