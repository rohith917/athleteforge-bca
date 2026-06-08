/**
 * AthleteForge sidebar — dark theme with gold navigation highlights.
 */
import { NavLink } from 'react-router-dom'
import {
  FaTachometerAlt, FaUsers, FaChartLine, FaBandAid,
  FaTrophy, FaClipboardCheck, FaWeight, FaFileAlt
} from 'react-icons/fa'
import Logo from './Logo'

const navItems = [
  { path: '/', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/athletes', icon: FaUsers, label: 'Athletes' },
  { path: '/performance', icon: FaChartLine, label: 'Performance' },
  { path: '/injuries', icon: FaBandAid, label: 'Injuries' },
  { path: '/competitions', icon: FaTrophy, label: 'Competitions' },
  { path: '/attendance', icon: FaClipboardCheck, label: 'Attendance' },
  { path: '/weight', icon: FaWeight, label: 'Weight' },
  { path: '/reports', icon: FaFileAlt, label: 'Reports' },
]

export default function Sidebar({ isOpen, onClose }) {
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
      </nav>

      <div className="sidebar-footer">
        <small>AthleteForge · BCA Final Year 2026</small>
      </div>
    </aside>
  )
}