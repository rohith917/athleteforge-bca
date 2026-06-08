/**
 * Top navbar with role badge, avatar, and theme toggle.
 */
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { FaSignOutAlt, FaMoon, FaSun, FaBars } from 'react-icons/fa'
import Avatar from './Avatar'

const roleLabels = { admin: 'Admin', coach: 'Coach', student: 'Student' }

export default function Navbar({ onMenuToggle }) {
  const { user, logout, isStudent, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
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
          {isAdmin ? 'AthleteForge · Admin Control' : isStudent ? 'AthleteForge · My Portal' : 'AthleteForge · Coach Dashboard'}
        </h4>
      </div>

      <div className="navbar-actions">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {isDark ? <FaSun /> : <FaMoon />}
        </button>
        <div className="user-chip">
          <Avatar src={user?.profile_photo} name={displayName} size="sm" />
          <span>{displayName}</span>
          {user?.role && (
            <span className={`role-badge role-${user.role}`}>{roleLabels[user.role] || user.role}</span>
          )}
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <FaSignOutAlt /> <span className="d-none d-md-inline">Logout</span>
        </button>
      </div>
    </header>
  )
}