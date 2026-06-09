/**
 * Top navbar with role badge, avatar, and theme toggle.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { FaSignOutAlt, FaMoon, FaSun, FaBars } from 'react-icons/fa'
import Avatar from './Avatar'
const roleLabels = { admin: 'Admin', coach: 'Coach', student: 'Student' }

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate()
  const { user, logout, isStudent, isCoach, isAdmin, actionLoading, getErrorMessage } = useAuth()
  const { isDark, toggleTheme, canToggleTheme } = useTheme()
  const { showToast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut || actionLoading) return
    setLoggingOut(true)
    try {
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      showToast(getErrorMessage(err, 'Logout failed. Please try again.'), 'error')
      navigate('/', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User'

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Menu">
          <FaBars />
        </button>
        <h4 className="page-title mb-0">
          {isAdmin ? 'Admin Command Center' : isStudent ? 'Athlete Portal' : isCoach ? 'Coach Command Center' : 'Dashboard'}
        </h4>
      </div>

      <div className="navbar-actions">
        {isAdmin && canToggleTheme && (
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
        )}
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
          <FaSignOutAlt /> <span className="d-none d-md-inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </header>
  )
}