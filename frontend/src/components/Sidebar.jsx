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
  { path: '/dashboard', icon: FaTachometerAlt, label: 'ADMIN PANEL' },
  { path: '/dashboard/admin/users', icon: FaUserShield, label: 'USER MANAGEMENT' },
  { path: '/dashboard/athletes', icon: FaUsers, label: 'ATHLETES' },
  { path: '/dashboard/performance', icon: FaChartLine, label: 'PERFORMANCE' },
  { path: '/dashboard/injuries', icon: FaBandAid, label: 'INJURIES' },
  { path: '/dashboard/competitions', icon: FaTrophy, label: 'COMPETITIONS' },
  { path: '/dashboard/attendance', icon: FaClipboardCheck, label: 'ATTENDANCE' },
  { path: '/dashboard/weight', icon: FaWeight, label: 'WEIGHT' },
  { path: '/dashboard/reports', icon: FaFileAlt, label: 'REPORTS' },
]

const coachNav = [
  { path: '/dashboard', icon: FaTachometerAlt, label: 'COACH DASHBOARD' },
  { path: '/dashboard/athletes', icon: FaUsers, label: 'MY ATHLETES' },
  { path: '/dashboard/performance', icon: FaChartLine, label: 'PERFORMANCE' },
  { path: '/dashboard/injuries', icon: FaBandAid, label: 'INJURY TRACKING' },
  { path: '/dashboard/competitions', icon: FaTrophy, label: 'COMPETITIONS' },
  { path: '/dashboard/attendance', icon: FaClipboardCheck, label: 'ATTENDANCE' },
  { path: '/dashboard/weight', icon: FaWeight, label: 'WEIGHT TRACKING' },
  { path: '/dashboard/reports', icon: FaFileAlt, label: 'REPORTS' },
]

const studentNav = [
  { path: '/dashboard', icon: FaTachometerAlt, label: 'MY DASHBOARD' },
  { path: '/dashboard/performance', icon: FaChartLine, label: 'MY PERFORMANCE' },
  { path: '/dashboard/injuries', icon: FaBandAid, label: 'MY INJURIES' },
  { path: '/dashboard/attendance', icon: FaClipboardCheck, label: 'MY ATTENDANCE' },
]

const ROLE_SIDEBAR = {
  admin: { label: 'ADMINISTRATOR', icon: FaUserShield, className: 'sidebar-role-admin' },
  coach: { label: 'COACH PANEL', icon: FaUserTie, className: 'sidebar-role-coach' },
  student: { label: 'ATHLETE PORTAL', icon: FaRunning, className: 'sidebar-role-student' },
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
        <Logo size="md" showTagline variant="light" />
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
          <FaHome /> <span>HOME</span>
        </NavLink>

        <div className="sidebar-nav-divider">{isStudent ? 'MY DATA' : isCoach ? 'TEAM MANAGEMENT' : 'SYSTEM'}</div>

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
            <FaUser /> <span>MY PROFILE</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <small>© 2026 AthleteForge</small>
      </div>
    </aside>
  )
}