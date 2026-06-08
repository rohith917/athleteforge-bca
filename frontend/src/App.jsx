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
import StudentDashboard from './pages/StudentDashboard'
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

function CoachRoute({ children }) {
  const { user, loading, isCoach } = useAuth()
  if (loading) return <LoadingSpinner message="Authenticating..." fullScreen />
  if (!user) return <Navigate to="/login" />
  if (!isCoach) return <Navigate to="/" />
  return children
}

function DashboardRouter() {
  const { isStudent } = useAuth()
  return isStudent ? <StudentDashboard /> : <Dashboard />
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
        <Route path="athletes/new" element={<CoachRoute><AthleteForm /></CoachRoute>} />
        <Route path="athletes/:id/edit" element={<CoachRoute><AthleteForm /></CoachRoute>} />
        <Route path="performance" element={<Performance />} />
        <Route path="injuries" element={<Injuries />} />
        <Route path="competitions" element={<CoachRoute><Competitions /></CoachRoute>} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="weight" element={<CoachRoute><WeightTracking /></CoachRoute>} />
        <Route path="reports" element={<CoachRoute><Reports /></CoachRoute>} />
      </Route>
    </Routes>
  )
}