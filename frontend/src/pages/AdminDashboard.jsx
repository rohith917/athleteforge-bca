/**
 * Admin Control Panel — premium system analytics
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { adminAPI } from '../services/api'
import {
  FaUsers, FaUserShield, FaUserGraduate, FaUserTie,
  FaBandAid, FaTrophy, FaChartLine, FaClipboardCheck,
  FaCog, FaExclamationTriangle, FaArrowRight
} from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import { KpiSkeletonGrid } from '../components/ui/Skeleton'
import Avatar from '../components/Avatar'
import UpcomingTournaments from '../components/UpcomingTournaments'
import TrainingPrograms from '../components/TrainingPrograms'
import CoachTips from '../components/CoachTips'
import NotificationCenter from '../components/analytics/NotificationCenter'
import { GOLD, baseChartOptions } from '../utils/chartTheme'

ChartJS.register(ArcElement, Tooltip, Legend)

const quickLinks = [
  { to: '/dashboard/admin/users', icon: FaUserShield, label: 'Manage Users', desc: 'Roles, access, athlete links' },
  { to: '/dashboard/athletes', icon: FaUsers, label: 'Athletes', desc: 'All athlete profiles' },
  { to: '/dashboard/performance', icon: FaChartLine, label: 'Performance', desc: 'Training metrics' },
  { to: '/dashboard/injuries', icon: FaBandAid, label: 'Injuries', desc: 'Recovery tracking' },
  { to: '/dashboard/competitions', icon: FaTrophy, label: 'Competitions', desc: 'Events & medals' },
  { to: '/dashboard/attendance', icon: FaClipboardCheck, label: 'Attendance', desc: 'Session records' },
  { to: '/dashboard/reports', icon: FaCog, label: 'Reports', desc: 'PDF & Excel exports' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats().then((res) => setStats(res.data))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="animate-in dashboard-premium">
      <PageHeader title="Admin Command Center" subtitle="Loading system analytics..." />
      <KpiSkeletonGrid count={8} />
    </div>
  )
  if (!stats) return <div className="alert-custom alert-danger-custom">Failed to load admin dashboard.</div>

  const roles = stats.users_by_role || {}
  const roleChart = {
    labels: ['Admins', 'Coaches', 'Students'],
    datasets: [{
      data: [roles.admin || 0, roles.coach || 0, roles.student || 0],
      backgroundColor: [GOLD, '#6366F1', '#22C55E'],
      borderWidth: 0,
    }],
  }

  return (
    <div className="animate-in dashboard-premium">
      <PageHeader
        title="Admin Command Center"
        subtitle="System analytics · User management · Platform oversight"
        action={
          <Link to="/dashboard/admin/users" className="btn-gold text-decoration-none">
            <FaUserShield /> Manage Users
          </Link>
        }
      />

      {stats.unlinked_students > 0 && (
        <div className="alert-custom mb-4" style={{
          background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
          border: '1px solid rgba(245,158,11,0.3)',
        }}>
          <FaExclamationTriangle className="me-2" />
          {stats.unlinked_students} student account(s) not linked to an athlete profile.
          <Link to="/dashboard/admin/users?role=student" className="auth-link ms-2">Fix now</Link>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUsers} label="Total Users" value={stats.total_users} change={6} trend="up" variant="gold" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUserTie} label="Coaches" value={roles.coach || 0} change={2} trend="up" variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUserGraduate} label="Students" value={roles.student || 0} change={8} trend="up" variant="info" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUserShield} label="Admins" value={roles.admin || 0} trend="neutral" variant="gold" />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUsers} label="Athletes" value={stats.total_athletes} change={10} trend="up" variant="gold" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaBandAid} label="Active Injuries" value={stats.active_injuries} change={5} trend="down" variant="danger" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaTrophy} label="Competitions" value={stats.total_competitions} change={12} trend="up" variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaChartLine} label="Perf. Records" value={stats.total_performance_records} change={15} trend="up" variant="warning" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="chart-panel-premium glass-card">
            <h6>Users by Role</h6>
            <div style={{ height: 200 }}>
              <Doughnut data={roleChart} options={{
                ...baseChartOptions,
                cutout: '65%',
                plugins: { ...baseChartOptions.plugins, legend: { position: 'bottom', labels: { color: '#94A3B8' } } },
              }} />
            </div>
            <div className="mt-3 text-center" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {stats.active_users} active · {stats.inactive_users} inactive
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="glass-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="analytics-card-title mb-0">Recent Users</h6>
              <Link to="/dashboard/admin/users" className="auth-link">View all <FaArrowRight /></Link>
            </div>
            {(stats.recent_users || []).map((u) => (
              <div className="user-card-premium" key={u.id}>
                <Avatar name={`${u.first_name} ${u.last_name}`} size="sm" />
                <div className="flex-grow-1">
                  <strong style={{ fontSize: '0.88rem' }}>{u.first_name} {u.last_name}</strong>
                  <small className="d-block text-muted">{u.email}</small>
                </div>
                <span className={`role-badge role-${u.role}`}>{u.role}</span>
                <span className={`badge-pill ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-3">
          <NotificationCenter />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12"><UpcomingTournaments /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7"><TrainingPrograms /></div>
        <div className="col-lg-5"><CoachTips /></div>
      </div>

      <div className="glass-card">
        <h6 className="analytics-card-title"><FaCog /> Quick Access — All Modules</h6>
        <div className="row g-3">
          {quickLinks.map((link) => (
            <div className="col-sm-6 col-md-4 col-lg-3" key={link.to}>
              <Link to={link.to} className="admin-quick-link">
                <link.icon className="admin-quick-icon" />
                <div>
                  <strong>{link.label}</strong>
                  <small>{link.desc}</small>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}