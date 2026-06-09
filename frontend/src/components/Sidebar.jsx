/**
 * Role-aware sidebar — distinct navigation per admin, coach, and athlete.
 */
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaTachometerAlt, FaUsers, FaChartLine, FaBandAid,
  FaTrophy, FaClipboardCheck, FaWeight, FaFileAlt, FaUser, FaUserShield, FaHome,
  FaUserTie, FaRunning
} from 'react-icons/fa'
import Logo from './Logo'

const adminNav = [
  { path: '/dashboard', icon: FaTachometerAlt, label: 'Admin Panel' },
  { path: '/dashboard/admin/users', icon: FaUserShield, label: 'User Management' },
  { path: '/dashboard/athletes', icon: FaUsers, label: 'Athletes' },
  { path: '/dashboard/performance', icon: FaChartLine, label: 'Performance' },
  { path: '/dashboard/injuries', icon: FaBandAid, label: 'Injuries' },
  { path: '/dashboard/competitions', icon: FaTrophy, label: 'Competitions' },
  { path: '/dashboard/attendance', icon: FaClipboardCheck, label: 'Attendance' },
  { path: '/dashboard/weight', icon: FaWeight, label: 'Weight' },
  { path: '/dashboard/reports', icon: FaFileAlt, label: 'Reports' },
]

const coachNav = [
  { path: '/dashboard', icon: FaTachometerAlt, label: 'Coach Dashboard' },
  { path: '/dashboard/athletes', icon: FaUsers, label: 'My Athletes' },
  { path: '/dashboard/performance', icon: FaChartLine, label: 'Performance' },
  { path: '/dashboard/injuries', icon: FaBandAid, label: 'Injury Tracking' },
  { path: '/dashboard/competitions', icon: FaTrophy, label: 'Competitions' },
  { path: '/dashboard/attendance', icon: FaClipboardCheck, label: 'Attendance' },
  { path: '/dashboard/weight', icon: FaWeight, label: 'Weight Tracking' },
  { path: '/dashboard/reports', icon: FaFileAlt, label: 'Reports' },
]

const studentNav = [
  { path: '/dashboard', icon: FaTachometerAlt, label: 'My Dashboard' },
  { path: '/dashboard/performance', icon: FaChartLine, label: 'My Performance' },
  { path: '/dashboard/injuries', icon: FaBandAid, label: 'My Injuries' },
  { path: '/dashboard/attendance', icon: FaClipboardCheck, label: 'My Attendance' },
]

const ROLE_SIDEBAR = {
  admin: { label: 'Administrator', icon: FaUserShield, className: 'sidebar-role-admin' },
  coach: { label: 'Coach Panel', icon: FaUserTie, className: 'sidebar-role-coach' },
  student: { label: 'Athlete Portal', icon: FaRunning, className: 'sidebar-role-student' },
}

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, isStudent, isCoach, user } = useAuth()
  const roleKey = isAdmin ? 'admin' : isStudent ? 'student' : 'coach'
  const roleMeta = ROLE_SIDEBAR[roleKey]
  const RoleIcon = roleMeta.icon
  const navItems = isAdmin ? adminNav : isStudent ? studentNav : coachNav
  const profilePath = isStudent && user?.athlete_id ? `/dashboard/athletes/${user.athlete_id}` : null

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${roleMeta.className}`}>
      <div className="sidebar-brand">
        <Logo size="md" showTagline />
      </div>

      <div className="sidebar-role-chip">
        <RoleIcon />
        <span>{roleMeta.label}</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item nav-item-home ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <FaHome /> <span>Home</span>
        </NavLink>

        <div className="sidebar-nav-divider">{isStudent ? 'My Data' : isCoach ? 'Team Management' : 'System'}</div>

        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon /> <span>{label}</span>
          </NavLink>
        ))}
        {profilePath && (
          <NavLink
            to={profilePath}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <FaUser /> <span>My Profile</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <small>© 2026 AthleteForge</small>
      </div>
    </aside>
  )
}