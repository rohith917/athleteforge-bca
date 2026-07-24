import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Preloader } from '@/components/layout/Preloader'
import { CustomCursor } from '@/components/motion/CustomCursor'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Home } from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PrivateRoute, GuestRoute, StaffRoute, CoachRoute, AdminRoute, FallbackRoute } from '@/routes/AuthGuards'
import DashboardHome from '@/pages/dashboard/DashboardHome'
import Athletes from '@/pages/dashboard/Athletes'
import AthleteForm from '@/pages/dashboard/AthleteForm'
import AthleteProfile from '@/pages/dashboard/AthleteProfile'
import Performance from '@/pages/dashboard/Performance'
import Injuries from '@/pages/dashboard/Injuries'
import Competitions from '@/pages/dashboard/Competitions'
import AttendancePage from '@/pages/dashboard/Attendance'
import WeightTracking from '@/pages/dashboard/WeightTracking'
import Leaderboard from '@/pages/dashboard/Leaderboard'
import Announcements from '@/pages/dashboard/Announcements'
import Reports from '@/pages/dashboard/Reports'
import UserManagement from '@/pages/dashboard/UserManagement'
import AcademyCatalog from '@/pages/dashboard/academy/AcademyCatalog'
import CourseDetail from '@/pages/dashboard/academy/CourseDetail'
import LessonPlayer from '@/pages/dashboard/academy/LessonPlayer'
import MyCertificates from '@/pages/dashboard/academy/MyCertificates'
import ResearchLibrary from '@/pages/dashboard/academy/ResearchLibrary'
import OrganizationsAdmin from '@/pages/dashboard/academy/OrganizationsAdmin'
import TrainingPrograms from '@/pages/dashboard/training/TrainingPrograms'
import ProgramBuilder from '@/pages/dashboard/training/ProgramBuilder'
import AthleteMonitoring from '@/pages/dashboard/training/AthleteMonitoring'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <SmoothScroll>
      <CustomCursor />
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <main>
                <Home ready={loaded} />
              </main>
              <Footer />
            </>
          }
        />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="athletes" element={<StaffRoute><Athletes /></StaffRoute>} />
          <Route path="athletes/new" element={<StaffRoute><AthleteForm /></StaffRoute>} />
          <Route path="athletes/:id" element={<AthleteProfile />} />
          <Route path="athletes/:id/edit" element={<StaffRoute><AthleteForm /></StaffRoute>} />
          <Route path="performance" element={<Performance />} />
          <Route path="injuries" element={<Injuries />} />
          <Route path="competitions" element={<CoachRoute><Competitions /></CoachRoute>} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="weight" element={<StaffRoute><WeightTracking /></StaffRoute>} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="reports" element={<CoachRoute><Reports /></CoachRoute>} />
          <Route path="admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="admin/organizations" element={<AdminRoute><OrganizationsAdmin /></AdminRoute>} />
          <Route path="training" element={<TrainingPrograms />} />
          <Route path="monitoring" element={<AthleteMonitoring />} />
          <Route path="training/:id" element={<ProgramBuilder />} />
          <Route path="academy" element={<AcademyCatalog />} />
          <Route path="academy/certificates" element={<MyCertificates />} />
          <Route path="academy/research" element={<ResearchLibrary />} />
          <Route path="academy/:slug" element={<CourseDetail />} />
          <Route path="academy/:courseSlug/lessons/:lessonSlug" element={<LessonPlayer />} />
        </Route>

        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </SmoothScroll>
  )
}
