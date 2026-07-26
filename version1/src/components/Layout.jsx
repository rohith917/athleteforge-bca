/**
 * Main layout — refined dark theme (Apple x Nike x Linear system in luxury.css)
 */
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'
import ChartThemeSync from './ChartThemeSync'
import ErrorBoundary from './ErrorBoundary'
import AICopilotWidget from './landing/AICopilotWidget'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, isStudent } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="app-layout dashboard-luxury">
      <ChartThemeSync />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
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