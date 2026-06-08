/**
 * Main layout — sidebar, navbar, animated content area
 */
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'
import { MotionPage } from './motion/Motion'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <AnimatePresence mode="wait">
            <MotionPage key={location.pathname}>
              <Outlet />
            </MotionPage>
          </AnimatePresence>
        </div>
        <Footer />
      </div>
    </div>
  )
}