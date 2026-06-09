/**
 * Route guards — protected, guest-only, role-based, and fallback routing.
 */
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import AdminDashboard from '../pages/AdminDashboard'
import StudentDashboard from '../pages/StudentDashboard'
import Dashboard from '../pages/Dashboard'

export function PrivateRoute({ children }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (!initializing && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (initializing) {
    return (
      <div className="auth-check-screen">
        <LoadingSpinner message="Checking your session..." fullScreen />
      </div>
    )
  }

  return children
}

export function GuestRoute({ children }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (!initializing && user) {
    const dest = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={dest} replace />
  }

  return children
}

export function StaffRoute({ children }) {
  const { user, initializing, isStaff } = useAuth()
  const location = useLocation()

  if (initializing) {
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
  const { user, initializing, isAdmin } = useAuth()
  const location = useLocation()

  if (initializing) {
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

export function DashboardRouter() {
  const { user, initializing, isAdmin, isStudent } = useAuth()

  if (initializing) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (isAdmin) return <AdminDashboard />
  if (isStudent) return <StudentDashboard />
  return <Dashboard />
}

export function FallbackRoute() {
  const { user, initializing } = useAuth()

  if (initializing) {
    return <Navigate to="/" replace />
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}