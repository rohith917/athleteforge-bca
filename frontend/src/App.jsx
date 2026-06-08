/**
 * Main App — routing with protected routes and loading state.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="athletes" element={<Athletes />} />
        <Route path="athletes/new" element={<AthleteForm />} />
        <Route path="athletes/:id/edit" element={<AthleteForm />} />
        <Route path="athletes/:id" element={<AthleteProfile />} />
        <Route path="performance" element={<Performance />} />
        <Route path="injuries" element={<Injuries />} />
        <Route path="competitions" element={<Competitions />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="weight" element={<WeightTracking />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}