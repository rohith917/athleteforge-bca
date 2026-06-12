/**
 * Admin Control Panel — uses /dashboard/stats/ (same session as coach dashboard)
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { dashboardAPI, ensureApiSession } from '../services/api'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'
import {
  FaUsers, FaUserShield, FaUserGraduate, FaUserTie,
  FaBandAid, FaTrophy, FaChartLine, FaClipboardCheck,
  FaCog, FaExclamationTriangle, FaArrowRight
} from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import RoleWelcomeBar from '../components/dashboard/RoleWelcomeBar'
import KpiCard from '../components/analytics/KpiCard'
import { KpiSkeletonGrid } from '../components/ui/Skeleton'
import Avatar from '../components/Avatar'
import UpcomingTournaments from '../components/UpcomingTournaments'
import TrainingPrograms from '../components/TrainingPrograms'
import CoachTips from '../components/CoachTips'
import NotificationCenter from '../components/analytics/NotificationCenter'
import { baseChartOptions } from '../utils/chartTheme'
import useChartsReady from '../hooks/useChartsReady'
import ChartMount from '../components/charts/ChartMount'
import { useTheme } from '../context/ThemeContext'
import TechCommandHub from '../components/tech/TechCommandHub'
import AIInsights from '../components/AIInsights'
import ErrorBoundary from '../components/ErrorBoundary'

ChartJS.register(ArcElement, Tooltip, Legend)

const quickLinks = [
  { to: '/dashboard/admin/users', icon: FaUserShield, label: 'MANAGE USERS', desc: 'Roles, access, athlete links' },
  { to: '/dashboard/athletes', icon: FaUsers, label: 'ATHLETES', desc: 'All athlete profiles' },
  { to: '/dashboard/performance', icon: FaChartLine, label: 'PERFORMANCE', desc: 'Training metrics' },
  { to: '/dashboard/injuries', icon: FaBandAid, label: 'INJURIES', desc: 'Recovery tracking' },
  { to: '/dashboard/competitions', icon: FaTrophy, label: 'COMPETITIONS', desc: 'Events & medals' },
  { to: '/dashboard/attendance', icon: FaClipboardCheck, label: 'ATTENDANCE', desc: 'Session records' },
  { to: '/dashboard/reports', icon: FaCog, label: 'REPORTS', desc: 'PDF & Excel exports' },
]

export default function AdminDashboard() {
  const chartsReady = useChartsReady()
  const { isDark } = useTheme()
  const { user, logout, checkAuth } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadStats = async () => {
    setLoading(true)
    setLoadError('')
    try {
      let activeUser = user
      if (!activeUser?.id) {
        activeUser = await checkAuth()
      }
      if (!activeUser?.id) {
        const sessionOk = await ensureApiSession()
        if (!sessionOk) {
          setLoadError('SESSION NOT VERIFIED — SIGN IN WITH ADMIN / ADMIN123.')
          setStats(null)
          return
        }
      }
      const res = await fetchWithTimeout(dashboardAPI.getStats(), 90000, 'Admin dashboard')
      if (res.data?.role !== 'admin') {
        setLoadError('ADMIN ACCESS REQUIRED — SIGN IN WITH ADMIN / ADMIN123.')
        setStats(null)
        return
      }
      setStats(res.data)
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        setLoadError('SESSION NOT VERIFIED — TAP SIGN IN AGAIN (ADMIN / ADMIN123).')
      } else if (err?.message?.includes('timed out')) {
        setLoadError('SERVER WAKING UP — WAIT 30 SECONDS AND TAP RETRY.')
      } else {
        setLoadError('COULD NOT LOAD ADMIN PANEL — TAP RETRY.')
      }
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReLogin = async () => {
    await logout()
    navigate('/login', {
      replace: true,
      state: {
        from: { pathname: '/dashboard' },
        prefill: { identifier: 'admin', password: 'admin123' },
      },
    })
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="animate-in dashboard-luxury">
        <PageHeader title="ADMIN COMMAND CENTER" subtitle="LOADING SYSTEM ANALYTICS..." />
        <KpiSkeletonGrid count={8} />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="animate-in dashboard-luxury admin-panel">
        <div className="alert-custom alert-danger-custom admin-session-alert">
          {loadError || 'FAILED TO LOAD ADMIN DASHBOARD.'}
          <div className="mt-3 d-flex flex-wrap gap-2">
            <button type="button" className="btn-gold" onClick={loadStats}>RETRY</button>
            <button type="button" className="btn-outline-gold" onClick={handleReLogin}>SIGN IN AGAIN</button>
          </div>
          <p className="mt-3 mb-0 small text-muted">
            DEMO: <code>admin</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    )
  }

  const roles = stats.users_by_role || {}
  const roleChart = {
    labels: ['ADMINS', 'COACHES', 'STUDENTS'],
    datasets: [{
      data: [roles.admin || 0, roles.coach || 0, roles.student || 0],
      backgroundColor: ['#ff3d3d', '#b8ff3c', '#22C55E'],
      borderWidth: 0,
    }],
  }

  return (
    <div className="animate-in dashboard-luxury admin-panel">
      <RoleWelcomeBar role="admin" />
      <PageHeader
        title="ADMIN COMMAND CENTER"
        subtitle="SYSTEM ANALYTICS · USER MANAGEMENT · PLATFORM OVERSIGHT"
        action={
          <Link to="/dashboard/admin/users" className="btn-gold text-decoration-none">
            <FaUserShield /> MANAGE USERS
          </Link>
        }
      />

      <TechCommandHub role="admin" readinessScore={88} />

      {stats.unlinked_students > 0 && (
        <div className="alert-custom mb-4 admin-alert-warn">
          <FaExclamationTriangle className="me-2" />
          {stats.unlinked_students} STUDENT ACCOUNT(S) NOT LINKED TO AN ATHLETE PROFILE.
          <Link to="/dashboard/admin/users?role=student" className="auth-link ms-2">FIX NOW</Link>
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUsers} label="TOTAL USERS" value={stats.total_users} change={6} trend="up" variant="gold" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUserTie} label="COACHES" value={roles.coach || 0} change={2} trend="up" variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUserGraduate} label="STUDENTS" value={roles.student || 0} change={8} trend="up" variant="info" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUserShield} label="ADMINS" value={roles.admin || 0} trend="neutral" variant="gold" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaUsers} label="ATHLETES" value={stats.total_athletes} change={10} trend="up" variant="gold" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaBandAid} label="ACTIVE INJURIES" value={stats.active_injuries} change={5} trend="down" variant="danger" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaTrophy} label="COMPETITIONS" value={stats.total_competitions} change={12} trend="up" variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaChartLine} label="PERF. RECORDS" value={stats.total_performance_records} change={15} trend="up" variant="warning" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="chart-panel-premium glass-card">
            <h6>USERS BY ROLE</h6>
            <ChartMount height={200} key={`admin-roles-${isDark}`}>
              {chartsReady && (
                <Doughnut data={roleChart} options={{
                  ...baseChartOptions,
                  cutout: '65%',
                  plugins: { ...baseChartOptions.plugins, legend: { position: 'bottom', labels: { color: isDark ? '#9CA3AF' : '#6B7280' } } },
                }} />
              )}
            </ChartMount>
            <div className="mt-3 text-center chart-footnote">
              {stats.active_users} ACTIVE · {stats.inactive_users} INACTIVE
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="glass-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="analytics-card-title mb-0">RECENT USERS</h6>
              <Link to="/dashboard/admin/users" className="auth-link">VIEW ALL <FaArrowRight /></Link>
            </div>
            {(stats.recent_users || []).map((u) => (
              <div className="user-card-premium" key={u.id}>
                <Avatar name={`${u.first_name} ${u.last_name}`} size="sm" />
                <div className="flex-grow-1">
                  <strong className="user-card-name">{u.first_name} {u.last_name}</strong>
                  <small className="d-block text-muted">{u.email}</small>
                </div>
                <span className={`role-badge role-${u.role}`}>{u.role}</span>
                <span className={`badge-pill ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                  {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-3">
          <NotificationCenter />
        </div>
      </div>

      <ErrorBoundary><AIInsights /></ErrorBoundary>

      <div className="row g-4 mb-4">
        <div className="col-12"><UpcomingTournaments /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7"><TrainingPrograms /></div>
        <div className="col-lg-5"><CoachTips /></div>
      </div>

      <div className="glass-card">
        <h6 className="analytics-card-title"><FaCog /> QUICK ACCESS — ALL MODULES</h6>
        <div className="row g-4">
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