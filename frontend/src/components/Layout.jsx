/**
 * Main layout — MDNT home colors only (black / red / lime)
 */
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'
import ChartThemeSync from './ChartThemeSync'
import ErrorBoundary from './ErrorBoundary'
import AICopilotWidget from './landing/AICopilotWidget'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const { user, isStudent } = useAuth()
  const { setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setTheme('dark')
  }, [setTheme])

  return (
    <div className="app-layout dashboard-mdnt home-theme-app">
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