/**
 * Top navbar with role badge, avatar, notification bell, and theme toggle.
 */
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { FaSignOutAlt, FaMoon, FaSun, FaBars, FaBell } from 'react-icons/fa'
import Avatar from './Avatar'
import NotificationCenter from './analytics/NotificationCenter'
import { notificationsAPI } from '../services/api'
import AthleteQuickSearch from './AthleteQuickSearch'

const roleLabels = { admin: 'ADMIN', coach: 'COACH', student: 'STUDENT' }

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate()
  const { user, logout, isStudent, isCoach, isAdmin, isStaff, actionLoading, getErrorMessage } = useAuth()
  const { isDark, toggleTheme, canToggleTheme } = useTheme()
  const { showToast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const bellRef = useRef(null)

  useEffect(() => {
    let active = true
    const poll = async () => {
      try {
        const res = await notificationsAPI.getAll()
        if (active) setUnread(res.data?.unread_count || 0)
      } catch {
        /* ignore — bell just shows 0 */
      }
    }
    poll()
    const interval = setInterval(poll, 60000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const onOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const handleLogout = async () => {
    if (loggingOut || actionLoading) return
    setLoggingOut(true)
    try {
      await logout({ hardRedirect: true })
    } catch (err) {
      showToast(getErrorMessage(err, 'Logout failed. Clearing session...'), 'error')
      window.location.assign('/')
    } finally {
      setLoggingOut(false)
    }
  }

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User'

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
        <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Menu">
          <FaBars />
        </button>
        <h4 className="page-title mb-0 d-none d-md-block">
          {isAdmin ? 'ADMIN COMMAND CENTER' : isStudent ? 'ATHLETE PORTAL' : isCoach ? 'COACH COMMAND CENTER' : 'DASHBOARD'}
        </h4>
        {isStaff && (
          <AthleteQuickSearch onSelect={(id) => navigate(`/dashboard/athletes/${id}`)} />
        )}
      </div>

      <div className="navbar-actions">
        {canToggleTheme && (
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
        )}

        <div className="navbar-bell-wrap" ref={bellRef}>
          <button
            type="button"
            className="navbar-bell-btn"
            onClick={() => setBellOpen((v) => !v)}
            aria-label="Notifications"
          >
            <FaBell />
            {unread > 0 && <span className="navbar-bell-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {bellOpen && (
            <div className="navbar-bell-dropdown glass-card">
              <NotificationCenter />
            </div>
          )}
        </div>

        <div className="user-chip">
          <Avatar src={user?.profile_photo} name={displayName} size="sm" />
          <span>{displayName}</span>
          {user?.role && (
            <span className={`role-badge role-${user.role}`}>{roleLabels[user.role] || user.role}</span>
          )}
        </div>
        <button
          className="btn-logout"
          onClick={handleLogout}
          disabled={loggingOut || actionLoading}
          aria-label="Logout"
        >
          <FaSignOutAlt /> <span className="d-none d-md-inline">{loggingOut ? 'LOGGING OUT...' : 'LOGOUT'}</span>
        </button>
      </div>
    </header>
  )
}
