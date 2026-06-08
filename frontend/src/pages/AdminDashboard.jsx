/**
 * Admin Control Panel — system overview, user stats, quick management links.
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
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Avatar from '../components/Avatar'

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
    adminAPI.getStats().then(res => setStats(res.data))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner message="Loading admin panel..." fullScreen />
  if (!stats) return <div className="alert-custom alert-danger-custom">Failed to load admin dashboard.</div>

  const roles = stats.users_by_role || {}
  const roleChart = {
    labels: ['Admins', 'Coaches', 'Students'],
    datasets: [{
      data: [roles.admin || 0, roles.coach || 0, roles.student || 0],
      backgroundColor: ['#C9A962', '#FFD700', '#22c55e'],
      borderWidth: 0,
    }],
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Admin Control Panel"
        subtitle="Full system management — users, athletes, and all modules"
        action={
          <Link to="/dashboard/admin/users" className="btn-gold text-decoration-none">
            <FaUserShield /> Manage Users
          </Link>
        }
      />

      {stats.unlinked_students > 0 && (
        <div className="alert-custom mb-4" style={{
          background: 'rgba(245,158,11,0.1)', color: 'var(--af-warning)',
          border: '1px solid rgba(245,158,11,0.3)',
        }}>
          <FaExclamationTriangle className="me-2" />
          {stats.unlinked_students} student account(s) not linked to an athlete profile.
          <Link to="/dashboard/admin/users?role=student" className="auth-link ms-2">Fix now</Link>
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={FaUsers} value={stats.total_users} label="Total Users" variant="primary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={FaUserTie} value={roles.coach || 0} label="Coaches" variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={FaUserGraduate} value={roles.student || 0} label="Students" variant="gold" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={FaUserShield} value={roles.admin || 0} label="Admins" variant="primary" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={FaUsers} value={stats.total_athletes} label="Athletes" variant="primary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={FaBandAid} value={stats.active_injuries} label="Active Injuries" variant="danger" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={FaTrophy} value={stats.total_competitions} label="Competitions" variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard icon={FaChartLine} value={stats.total_performance_records} label="Perf. Records" variant="gold" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="chart-panel">
            <h6>Users by Role</h6>
            <Doughnut data={roleChart} options={{
              responsive: true,
              cutout: '65%',
              plugins: { legend: { position: 'bottom', labels: { color: '#B8C5D6' } } },
            }} />
            <div className="mt-3 text-center" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {stats.active_users} active · {stats.inactive_users} inactive
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card-panel">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-panel-title mb-0">Recent Users</h5>
              <Link to="/dashboard/admin/users" className="auth-link">View all <FaArrowRight /></Link>
            </div>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(stats.recent_users || []).map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar name={`${u.first_name} ${u.last_name}`} size="sm" />
                          <span>{u.first_name} {u.last_name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                      <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                      <td>
                        <span className={`badge-pill ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h5 className="card-panel-title"><FaCog /> Quick Access — All Modules</h5>
        <div className="row g-3">
          {quickLinks.map(link => (
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