/**
 * Main App — public landing + protected dashboard routes.
 */
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ThemeRoleGuard from './components/ThemeRoleGuard'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
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
import {
  PrivateRoute,
  GuestRoute,
  StaffRoute,
  AdminRoute,
  DashboardRouter,
  FallbackRoute,
} from './routes/AuthGuards'

export default function App() {
  return (
    <>
      <ThemeRoleGuard />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected app */}
        <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
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

        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </>
  )
}