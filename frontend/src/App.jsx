/**
 * Main App — routing with role-based access control.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'
import UserManagement from './pages/UserManagement'
import Athletes from './pages/Athletes'
import AthleteForm from './pages/AthleteForm'
import AthleteProfile from './pages/AthleteProfile'
import Performance from './pages/Performance'
import Injuries from './pages/Injuries'
import Competitions from './pages/Competitions'
import Attendance from './pages/Attendance'
import WeightTracking from './pages/WeightTracking'
import Reports from './pages/Reports'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner message="Authenticating..." fullScreen />
  return user ? children : <Navigate to="/login" />
}

function StaffRoute({ children }) {
  const { user, loading, isStaff } = useAuth()
  if (loading) return <LoadingSpinner message="Authenticating..." fullScreen />
  if (!user) return <Navigate to="/login" />
  if (!isStaff) return <Navigate to="/" />
  return children
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <LoadingSpinner message="Authenticating..." fullScreen />
  if (!user) return <Navigate to="/login" />
  if (!isAdmin) return <Navigate to="/" />
  return children
}

function DashboardRouter() {
  const { isAdmin, isStudent } = useAuth()
  if (isAdmin) return <AdminDashboard />
  if (isStudent) return <StudentDashboard />
  return <Dashboard />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardRouter />} />
        <Route path="athletes" element={<Athletes />} />
        <Route path="athletes/:id" element={<AthleteProfile />} />
        <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="athletes/new" element={<StaffRoute><AthleteForm /></StaffRoute>} />
        <Route path="athletes/:id/edit" element={<StaffRoute><AthleteForm /></StaffRoute>} />
        <Route path="performance" element={<Performance />} />
        <Route path="injuries" element={<Injuries />} />
        <Route path="competitions" element={<StaffRoute><Competitions /></StaffRoute>} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="weight" element={<StaffRoute><WeightTracking /></StaffRoute>} />
        <Route path="reports" element={<StaffRoute><Reports /></StaffRoute>} />
      </Route>
    </Routes>
  )
}