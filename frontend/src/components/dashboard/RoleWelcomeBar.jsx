/**
 * Role-specific welcome banner for coach / student / admin dashboards.
 */
import { motion } from 'framer-motion'
import { FaUserTie, FaRunning, FaUserShield } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

const ROLE_META = {
  coach: {
    icon: FaUserTie,
    label: 'Coach Command Center',
    desc: 'Manage your roster, track performance, injuries, and team readiness.',
    className: 'role-welcome-coach',
  },
  student: {
    icon: FaRunning,
    label: 'Athlete Performance Hub',
    desc: 'Your personal training data, recovery, attendance, and progress.',
    className: 'role-welcome-student',
  },
  admin: {
    icon: FaUserShield,
    label: 'System Administration',
    desc: 'Platform oversight, users, and full system analytics.',
    className: 'role-welcome-admin',
  },
}

export default function RoleWelcomeBar({ role: roleOverride }) {
  const { user, isAdmin, isStudent, isCoach } = useAuth()
  const role = roleOverride || (isAdmin ? 'admin' : isStudent ? 'student' : 'coach')
  const meta = ROLE_META[role] || ROLE_META.coach
  const Icon = meta.icon
  const name = user?.first_name || user?.username || 'User'

  return (
    <motion.div
      className={`role-welcome-bar ${meta.className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="role-welcome-icon"><Icon /></div>
      <div className="role-welcome-text">
        <span className="role-welcome-eyebrow">{meta.label}</span>
        <h3 className="role-welcome-title">Welcome, {name}</h3>
        <p className="role-welcome-desc">{meta.desc}</p>
      </div>
      <span className={`role-badge role-${role}`}>{role}</span>
    </motion.div>
  )
}