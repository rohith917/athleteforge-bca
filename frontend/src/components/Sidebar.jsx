/**
 * Role-aware sidebar navigation — navy theme with cyan accents.
 */
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FaTachometerAlt, FaUsers, FaChartLine, FaBandAid,
  FaTrophy, FaClipboardCheck, FaWeight, FaFileAlt, FaUser
} from 'react-icons/fa'
import Logo from './Logo'

const coachNav = [
  { path: '/', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/athletes', icon: FaUsers, label: 'Athletes' },
  { path: '/performance', icon: FaChartLine, label: 'Performance' },
  { path: '/injuries', icon: FaBandAid, label: 'Injuries' },
  { path: '/competitions', icon: FaTrophy, label: 'Competitions' },
  { path: '/attendance', icon: FaClipboardCheck, label: 'Attendance' },
  { path: '/weight', icon: FaWeight, label: 'Weight' },
  { path: '/reports', icon: FaFileAlt, label: 'Reports' },
]

const studentNav = [
  { path: '/', icon: FaTachometerAlt, label: 'My Dashboard' },
  { path: '/performance', icon: FaChartLine, label: 'My Performance' },
  { path: '/injuries', icon: FaBandAid, label: 'My Injuries' },
  { path: '/attendance', icon: FaClipboardCheck, label: 'My Attendance' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { isStudent, user } = useAuth()
  const navItems = isStudent ? studentNav : coachNav

  const profilePath = isStudent && user?.athlete_id ? `/athletes/${user.athlete_id}` : null

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <Logo size="md" showTagline />
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
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