/**
 * Main layout — sidebar, navbar, animated content area
 */
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'
import ChartThemeSync from './ChartThemeSync'
import ErrorBoundary from './ErrorBoundary'
import AICopilotWidget from './landing/AICopilotWidget'
import DashboardMarquee from './dashboard/DashboardMarquee'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, isStudent } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="app-layout dashboard-mdnt">
      <ChartThemeSync />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <DashboardMarquee />
        <div className="page-content">
          <div className="dashboard-mesh-bg" aria-hidden="true" />
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
        <Footer />
      </div>
      <AICopilotWidget
        mode="app"
        athleteId={isStudent ? user?.athlete_id : null}
      />
    </div>
  )
}