/**
 * Athlete / student-only quick links — personal data only.
 */
import { Link } from 'react-router-dom'
import {
  FaChartLine, FaBandAid, FaClipboardCheck, FaUser, FaHeartbeat, FaTrophy
} from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

export default function StudentQuickActions() {
  const { user } = useAuth()
  const profileTo = user?.athlete_id ? `/dashboard/athletes/${user.athlete_id}` : '/dashboard'

  const actions = [
    { to: '/dashboard/performance', icon: FaChartLine, label: 'My Performance', desc: 'Scores & trends' },
    { to: '/dashboard/injuries', icon: FaBandAid, label: 'My Injuries', desc: 'Recovery status' },
    { to: '/dashboard/attendance', icon: FaClipboardCheck, label: 'My Attendance', desc: 'Session history' },
    { to: profileTo, icon: FaUser, label: 'My Profile', desc: 'Athlete details' },
    { to: '/dashboard/performance', icon: FaHeartbeat, label: 'Readiness', desc: 'Wellness check' },
    { to: '/dashboard/performance', icon: FaTrophy, label: 'My Results', desc: 'Competition stats' },
  ]

  return (
    <div className="role-quick-actions student-quick-actions">
      <h6 className="role-section-title">My Athlete Tools</h6>
      <div className="role-quick-grid student-quick-grid">
        {actions.map(({ to, icon: Icon, label, desc }) => (
          <Link key={label} to={to} className="role-quick-card student-quick-card">
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