/**
 * Student/Athlete dashboard — personal stats, AI insights, limited view.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaBandAid, FaClipboardCheck, FaChartLine, FaUser } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import AIInsights from '../components/AIInsights'
import Avatar from '../components/Avatar'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const CYAN = '#00D4FF'
const chartOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: '#B8C5D6', font: { family: 'Inter' } } } },
  scales: {
    x: { grid: { color: '#1E3358' }, ticks: { color: '#8B9CB5' } },
    y: { grid: { color: '#1E3358' }, ticks: { color: '#8B9CB5' } },
  },
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats().then(res => setStats(res.data))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner message="Loading your dashboard..." fullScreen />
  if (!stats) return <div className="alert-custom alert-danger-custom">Failed to load dashboard.</div>

  const athlete = stats.athlete
  const perfChart = {
    labels: ['Speed', 'Strength', 'Endurance', 'Flexibility', 'Agility'],
    datasets: [{
      label: 'Your Scores',
      data: Object.values(stats.avg_performance),
      backgroundColor: [CYAN, '#00A8CC', '#22c55e', '#3b82f6', '#C9A962'],
      borderRadius: 8,
    }],
  }

  const attendanceChart = {
    labels: stats.monthly_attendance.map(m => m.month),
    datasets: [{
      label: 'Attendance %',
      data: stats.monthly_attendance.map(m => m.rate),
      borderColor: CYAN,
      backgroundColor: 'rgba(0,212,255,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: CYAN,
    }],
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="My Dashboard"
        subtitle={`Welcome back, ${user?.first_name || athlete?.first_name || 'Athlete'}`}
      />

      <div className="profile-hero mb-4">
        <Avatar
          src={user?.profile_photo || athlete?.avatar_url}
          name={athlete?.full_name || user?.username}
          size="lg"
        />
        <div className="profile-hero-info">
          <h3>{athlete?.full_name}</h3>
          <p>{athlete?.sport} · {athlete?.team} · <span className="role-badge role-student">Student</span></p>
          {athlete?.id && (
            <Link to={`/athletes/${athlete.id}`} className="btn-outline-navy mt-2">
              <FaUser className="me-1" /> View My Profile
            </Link>
          )}
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-sm-4">
          <StatCard icon={FaChartLine} value={stats.avg_performance?.endurance || 0} label="Endurance Score" variant="primary" />
        </div>
        <div className="col-sm-4">
          <StatCard icon={FaBandAid} value={stats.active_injuries} label="Active Injuries" variant="danger" />
        </div>
        <div className="col-sm-4">
          <StatCard icon={FaClipboardCheck} value={`${stats.monthly_attendance?.slice(-1)[0]?.rate || 0}%`} label="Latest Attendance" variant="success" />
        </div>
      </div>

      <AIInsights athleteId={athlete?.id} />

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="chart-panel">
            <h6>My Performance</h6>
            <Bar data={perfChart} options={{ ...chartOpts, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-panel">
            <h6>My Attendance Trend</h6>
            <Line data={attendanceChart} options={{ ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, max: 100 } } }} />
          </div>
        </div>
      </div>
    </div>
  )
}