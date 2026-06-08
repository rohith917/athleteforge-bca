/**
 * Athlete Dashboard — personal performance, wellness, readiness
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaBandAid, FaClipboardCheck, FaChartLine, FaUser } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import { KpiSkeletonGrid } from '../components/ui/Skeleton'
import AIInsights from '../components/AIInsights'
import ReadinessGauge from '../components/analytics/ReadinessGauge'
import RecoveryPanel from '../components/analytics/RecoveryPanel'
import WellnessCheckIn from '../components/analytics/WellnessCheckIn'
import PerformanceRadar from '../components/analytics/PerformanceRadar'
import Avatar from '../components/Avatar'
import { GOLD, baseChartOptions } from '../utils/chartTheme'
import { calcRecoveryScore } from '../utils/metricsEngine'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend)

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [wellness, setWellness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats().then((res) => setStats(res.data))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="animate-in dashboard-premium">
      <PageHeader title="My Performance Hub" subtitle="Loading your analytics..." />
      <KpiSkeletonGrid count={3} />
    </div>
  )
  if (!stats) return <div className="alert-custom alert-danger-custom">Failed to load dashboard.</div>

  const athlete = stats.athlete
  const recovery = calcRecoveryScore(stats)
  const attRate = stats.monthly_attendance?.slice(-1)[0]?.rate ?? 0

  const radarScores = {
    speed: stats.avg_performance?.speed,
    strength: stats.avg_performance?.strength,
    endurance: stats.avg_performance?.endurance,
    flexibility: stats.avg_performance?.flexibility,
    agility: stats.avg_performance?.agility,
    power: stats.avg_performance?.strength,
    recovery: recovery.score,
  }

  const attendanceChart = {
    labels: stats.monthly_attendance.map((m) => m.month),
    datasets: [{
      data: stats.monthly_attendance.map((m) => m.rate),
      borderColor: GOLD,
      backgroundColor: 'rgba(212, 175, 55, 0.12)',
      fill: true,
      tension: 0.4,
    }],
  }

  return (
    <div className="animate-in dashboard-premium">
      <PageHeader
        title="My Performance Hub"
        subtitle={`Welcome back, ${user?.first_name || athlete?.first_name || 'Athlete'}`}
      />

      <div className="profile-premium-hero glass-card mb-4">
        <Avatar
          src={user?.profile_photo || athlete?.avatar_url}
          name={athlete?.full_name || user?.username}
          size="lg"
        />
        <div className="flex-grow-1">
          <h2 className="page-heading mb-1">{athlete?.full_name}</h2>
          <p className="page-subtitle">{athlete?.sport} · {athlete?.team} · <span className="role-badge role-student">Athlete</span></p>
          {athlete?.id && (
            <Link to={`/dashboard/athletes/${athlete.id}`} className="btn-outline-gold mt-2 text-decoration-none">
              <FaUser className="me-1" /> View Full Profile
            </Link>
          )}
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <KpiCard icon={FaChartLine} label="Endurance Score" value={stats.avg_performance?.endurance || 0} change={5} trend="up" variant="gold" />
        </div>
        <div className="col-sm-4">
          <KpiCard icon={FaBandAid} label="Active Injuries" value={stats.active_injuries} change={0} trend="neutral" variant="danger" />
        </div>
        <div className="col-sm-4">
          <KpiCard icon={FaClipboardCheck} label="Attendance" value={`${attRate}%`} change={3} trend="up" variant="success" sparkData={stats.monthly_attendance?.map((m) => m.rate)} />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4"><ReadinessGauge wellness={wellness} /></div>
        <div className="col-lg-4"><RecoveryPanel stats={stats} /></div>
        <div className="col-lg-4"><WellnessCheckIn onUpdate={setWellness} /></div>
      </div>

      <AIInsights athleteId={athlete?.id} />

      <div className="row g-4 mt-2">
        <div className="col-lg-5">
          <div className="chart-panel-premium glass-card h-100">
            <h6>My Performance Profile</h6>
            <PerformanceRadar scores={radarScores} />
          </div>
        </div>
        <div className="col-lg-7">
          <div className="chart-panel-premium glass-card" style={{ minHeight: 320 }}>
            <h6>Attendance Trend</h6>
            <div style={{ height: 260 }}>
              <Line data={attendanceChart} options={{
                ...baseChartOptions,
                scales: {
                  x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                  y: { min: 0, max: 100, ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
                },
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}