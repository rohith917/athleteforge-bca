/**
 * AthleteForge top navbar.
 */
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { FaSignOutAlt, FaUser, FaMoon, FaSun, FaBars } from 'react-icons/fa'

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Menu">
          <FaBars />
        </button>
        <h4 className="page-title mb-0">AthleteForge Dashboard</h4>
      </div>

      <div className="navbar-actions">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {isDark ? <FaSun /> : <FaMoon />}
        </button>
        <div className="user-chip">
          <FaUser />
          <span>{user?.first_name || user?.username || 'Admin'}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <FaSignOutAlt /> <span className="d-none d-md-inline">Logout</span>
        </button>
      </div>
    </header>
  )
}