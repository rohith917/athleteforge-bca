/**
 * Role-aware sidebar — admin, coach, and student navigation.
 */
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaTachometerAlt, FaUsers, FaChartLine, FaBandAid,
  FaTrophy, FaClipboardCheck, FaWeight, FaFileAlt, FaUser, FaUserShield, FaHome
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
  { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/dashboard/athletes', icon: FaUsers, label: 'Athletes' },
  { path: '/dashboard/performance', icon: FaChartLine, label: 'Performance' },
  { path: '/dashboard/injuries', icon: FaBandAid, label: 'Injuries' },
  { path: '/dashboard/competitions', icon: FaTrophy, label: 'Competitions' },
  { path: '/dashboard/attendance', icon: FaClipboardCheck, label: 'Attendance' },
  { path: '/dashboard/weight', icon: FaWeight, label: 'Weight' },
  { path: '/dashboard/reports', icon: FaFileAlt, label: 'Reports' },
]

const studentNav = [
  { path: '/dashboard', icon: FaTachometerAlt, label: 'My Dashboard' },
  { path: '/dashboard/performance', icon: FaChartLine, label: 'My Performance' },
  { path: '/dashboard/injuries', icon: FaBandAid, label: 'My Injuries' },
  { path: '/dashboard/attendance', icon: FaClipboardCheck, label: 'My Attendance' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, isStudent, user } = useAuth()
  const navItems = isAdmin ? adminNav : isStudent ? studentNav : coachNav
  const profilePath = isStudent && user?.athlete_id ? `/dashboard/athletes/${user.athlete_id}` : null

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <Logo size="md" showTagline />
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item nav-item-home ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <FaHome /> <span>Home</span>
        </NavLink>

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
        <small>AthleteForge · BCA Final Year 2026</small>
      </div>
    </aside>
  )
}