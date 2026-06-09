/**
 * Coach-only quick action tiles.
 */
import { Link } from 'react-router-dom'
import {
  FaUserPlus, FaClipboardCheck, FaBandAid, FaChartLine,
  FaTrophy, FaFileAlt, FaUsers
} from 'react-icons/fa'

const actions = [
  { to: '/dashboard/athletes/new', icon: FaUserPlus, label: 'Add Athlete', desc: 'Register new player' },
  { to: '/dashboard/attendance', icon: FaClipboardCheck, label: 'Mark Attendance', desc: 'Session check-in' },
  { to: '/dashboard/injuries', icon: FaBandAid, label: 'Report Injury', desc: 'Log & track recovery' },
  { to: '/dashboard/performance', icon: FaChartLine, label: 'Log Performance', desc: 'Training metrics' },
  { to: '/dashboard/competitions', icon: FaTrophy, label: 'Competitions', desc: 'Events & medals' },
  { to: '/dashboard/reports', icon: FaFileAlt, label: 'Export Reports', desc: 'PDF & Excel' },
  { to: '/dashboard/athletes', icon: FaUsers, label: 'View Roster', desc: 'All athletes' },
]

export default function CoachQuickActions() {
  return (
    <div className="role-quick-actions coach-quick-actions">
      <h6 className="role-section-title">Coach Tools</h6>
      <div className="role-quick-grid">
        {actions.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="role-quick-card">
            <div className="role-quick-icon"><Icon /></div>
            <div>
              <strong>{label}</strong>
              <small>{desc}</small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}