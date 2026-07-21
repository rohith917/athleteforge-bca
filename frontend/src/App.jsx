/**
 * Main App — public landing + protected dashboard routes.
 * Routes are lazy-loaded so each page ships as its own chunk.
 */
import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import {
  PrivateRoute,
  GuestRoute,
  StaffRoute,
  AdminRoute,
  CoachRoute,
  DashboardRouter,
  FallbackRoute,
} from './routes/AuthGuards'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const UserManagement = lazy(() => import('./pages/UserManagement'))
const Athletes = lazy(() => import('./pages/Athletes'))
const AthleteForm = lazy(() => import('./pages/AthleteForm'))
const AthleteProfile = lazy(() => import('./pages/AthleteProfile'))
const Performance = lazy(() => import('./pages/Performance'))
const Injuries = lazy(() => import('./pages/Injuries'))
const Competitions = lazy(() => import('./pages/Competitions'))
const Attendance = lazy(() => import('./pages/Attendance'))
const WeightTracking = lazy(() => import('./pages/WeightTracking'))
const Reports = lazy(() => import('./pages/Reports'))

function RouteFallback() {
  return (
    <div className="loading-spinner-wrap fullscreen">
      <div className="spinner-ring" aria-hidden="true" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
          <Route path="athletes" element={<StaffRoute><Athletes /></StaffRoute>} />
          <Route path="athletes/:id" element={<AthleteProfile />} />
          <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="athletes/new" element={<StaffRoute><AthleteForm /></StaffRoute>} />
          <Route path="athletes/:id/edit" element={<StaffRoute><AthleteForm /></StaffRoute>} />
          <Route path="performance" element={<Performance />} />
          <Route path="injuries" element={<Injuries />} />
          <Route path="competitions" element={<CoachRoute><Competitions /></CoachRoute>} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="weight" element={<StaffRoute><WeightTracking /></StaffRoute>} />
          <Route path="reports" element={<CoachRoute><Reports /></CoachRoute>} />
        </Route>

        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </Suspense>
  )
}
