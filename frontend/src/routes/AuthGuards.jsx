/**
 * Route guards — protected, guest-only, role-based, and fallback routing.
 */
import { Suspense, lazy } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'))
const Dashboard = lazy(() => import('../pages/Dashboard'))

export function PrivateRoute({ children }) {
  const { user, authChecked, bootstrapMessage, retryBootstrap, actionLoading } = useAuth()
  const location = useLocation()

  if (!authChecked || actionLoading) {
    return (
      <div className="auth-check-screen">
        <LoadingSpinner
          message={bootstrapMessage || 'Checking your session...'}
          fullScreen
          onRetry={retryBootstrap}
        />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function GuestRoute({ children }) {
  const { user, authChecked, actionLoading } = useAuth()
  const location = useLocation()

  if (!authChecked || actionLoading) {
    return <LoadingSpinner message="Loading..." fullScreen />
  }

  if (user) {
    const dest = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={dest} replace />
  }

  return children
}

export function StaffRoute({ children }) {
  const { user, authChecked, isStaff } = useAuth()
  const location = useLocation()

  if (!authChecked) {
    return <LoadingSpinner message="Checking your session..." fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isStaff) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { user, authChecked, isAdmin } = useAuth()
  const location = useLocation()

  if (!authChecked) {
    return <LoadingSpinner message="Checking your session..." fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function CoachRoute({ children }) {
  const { user, authChecked, isCoach, isAdmin } = useAuth()
  const location = useLocation()

  if (!authChecked) {
    return <LoadingSpinner message="Checking your session..." fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isCoach && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function StudentRoute({ children }) {
  const { user, authChecked, isStudent } = useAuth()
  const location = useLocation()

  if (!authChecked) {
    return <LoadingSpinner message="Checking your session..." fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isStudent) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function DashboardRouter() {
  const { user, authChecked, isAdmin, isStudent, isCoach } = useAuth()

  if (!authChecked) {
    return <LoadingSpinner message="Loading dashboard..." fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner message="Loading dashboard..." fullScreen />}>
        {isAdmin && <AdminDashboard />}
        {!isAdmin && isStudent && <StudentDashboard />}
        {!isAdmin && !isStudent && isCoach && <Dashboard />}
        {!isAdmin && !isStudent && !isCoach && (
          <div className="alert-custom alert-danger-custom m-4">
            Unknown role. Please contact your administrator.
          </div>
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

export function FallbackRoute() {
  const { user, authChecked } = useAuth()

  if (!authChecked) {
    return <Navigate to="/" replace />
  }

  return <Navigate to={user ? '/dashboard' : '/'} replace />
}