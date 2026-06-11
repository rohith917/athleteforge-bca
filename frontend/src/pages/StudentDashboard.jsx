/**
 * Athlete / Student Dashboard — personal performance hub (students only)
 */
import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { dashboardAPI, ensureApiSession } from '../services/api'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'
import { useAuth } from '../context/AuthContext'
import { FaBandAid, FaClipboardCheck, FaChartLine, FaUser, FaTrophy, FaMedal } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import { KpiSkeletonGrid } from '../components/ui/Skeleton'
import AIInsights from '../components/AIInsights'
import ReadinessGauge from '../components/analytics/ReadinessGauge'
import RecoveryPanel from '../components/analytics/RecoveryPanel'
import WellnessCheckIn from '../components/analytics/WellnessCheckIn'
import PerformanceRadar from '../components/analytics/PerformanceRadar'
import Avatar from '../components/Avatar'
import RoleWelcomeBar from '../components/dashboard/RoleWelcomeBar'
import StudentQuickActions from '../components/dashboard/StudentQuickActions'
import StudentLinkAlert from '../components/dashboard/StudentLinkAlert'
import StudentInjuryStatus from '../components/dashboard/StudentInjuryStatus'
import StudentTrainingTips from '../components/dashboard/StudentTrainingTips'
import ChartMount from '../components/charts/ChartMount'
import useChartsReady from '../hooks/useChartsReady'
import { GOLD, baseChartOptions } from '../utils/chartTheme'
import { calcRecoveryScore } from '../utils/metricsEngine'
import TechCommandHub from '../components/tech/TechCommandHub'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend)

export default function StudentDashboard() {
  const chartsReady = useChartsReady()
  const { user, isStudent } = useAuth()
  const [stats, setStats] = useState(null)
  const [wellness, setWellness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadStats = async () => {
    setLoading(true)
    setLoadError('')
    try {
      await ensureApiSession()
      const res = await fetchWithTimeout(dashboardAPI.getStats(), 60000, 'Dashboard')
      setStats(res.data)
    } catch {
      setLoadError('Could not load your dashboard. The server may still be waking up.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isStudent) {
      setLoading(false)
      return
    }
    loadStats()
  }, [isStudent])

  if (!isStudent) return <Navigate to="/dashboard" replace />

  if (loading) return (
    <div className="animate-in dashboard-luxury student-panel">
      <PageHeader title="My Performance Hub" subtitle="Loading your analytics..." />
      <KpiSkeletonGrid count={4} />
    </div>
  )

  if (!stats) {
    return (
      <div className="animate-in dashboard-luxury student-panel">
        <div className="alert-custom alert-danger-custom">
          {loadError || 'Failed to load dashboard.'}
          <button type="button" className="btn-gold ms-3" onClick={loadStats}>Retry</button>
        </div>
      </div>
    )
  }

  const notLinked = stats.linked === false || !stats.athlete

  if (notLinked) {
    return (
      <div className="animate-in dashboard-luxury student-panel">
        <RoleWelcomeBar role="student" />
        <StudentLinkAlert message={stats.message} />
        <StudentQuickActions />
      </div>
    )
  }

  const athlete = stats.athlete
  const recovery = calcRecoveryScore(stats)
  const attRate = stats.monthly_attendance?.slice(-1)[0]?.rate ?? 0
  const medals = (stats.gold_medals || 0) + (stats.silver_medals || 0) + (stats.bronze_medals || 0)

  const radarScores = {
    speed: stats.avg_performance?.speed,
    strength: stats.avg_performance?.strength,
    endurance: stats.avg_performance?.endurance,
    flexibility: stats.avg_performance?.flexibility,
    agility: stats.avg_performance?.agility,
    power: stats.avg_performance?.strength,
    recovery: recovery.score,
  }

  const monthlyAtt = stats.monthly_attendance || []
  const attendanceChart = {
    labels: monthlyAtt.length ? monthlyAtt.map((m) => m.month) : ['—'],
    datasets: [{
      data: monthlyAtt.length ? monthlyAtt.map((m) => m.rate) : [0],
      borderColor: '#b8ff3c',
      backgroundColor: 'rgba(184, 255, 60, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  }

  return (
    <div className="animate-in dashboard-luxury student-panel">
      <RoleWelcomeBar role="student" />
      <StudentQuickActions />

      <div className="profile-premium-hero glass-card mb-4 student-profile-hero">
        <Avatar
          src={user?.profile_photo || athlete?.avatar_url}
          name={athlete?.full_name || user?.username}
          size="lg"
        />
        <div className="flex-grow-1">
          <h2 className="page-heading mb-1">{athlete?.full_name}</h2>
          <p className="page-subtitle">
            {athlete?.sport} · {athlete?.team} · <span className="role-badge role-student">Athlete</span>
          </p>
          {athlete?.id && (
            <Link to={`/dashboard/athletes/${athlete.id}`} className="btn-outline-gold mt-2 text-decoration-none">
              <FaUser className="me-1" /> View Full Profile
            </Link>
          )}
        </div>
      </div>

      <AIInsights athleteId={athlete?.id} />

      <TechCommandHub
        role="student"
        athleteId={athlete?.id}
        readinessScore={recovery.score}
      />

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <KpiCard icon={FaChartLine} label="Avg Performance" value={`${Math.round((stats.avg_performance?.endurance || 0))}%`} change={5} trend="up" variant="gold" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <KpiCard icon={FaBandAid} label="Active Injuries" value={stats.active_injuries} change={0} trend="neutral" variant="danger" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <KpiCard icon={FaClipboardCheck} label="Attendance" value={`${attRate}%`} change={3} trend="up" variant="success" sparkData={stats.monthly_attendance?.map((m) => m.rate)} />
        </div>
        <div className="col-sm-6 col-lg-3">
          <KpiCard icon={FaTrophy} label="Medals Won" value={medals} change={2} trend="up" variant="gold" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4"><ReadinessGauge wellness={wellness} /></div>
        <div className="col-lg-4"><StudentInjuryStatus /></div>
        <div className="col-lg-4"><WellnessCheckIn onUpdate={setWellness} /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8"><RecoveryPanel stats={stats} /></div>
        <div className="col-lg-4"><StudentTrainingTips /></div>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-lg-5">
          <div className="chart-panel-premium glass-card h-100">
            <h6><FaMedal className="me-2" />My Performance Profile</h6>
            <PerformanceRadar scores={radarScores} />
          </div>
        </div>
        <div className="col-lg-7">
          <div className="chart-panel-premium glass-card" style={{ minHeight: 320 }}>
            <h6>My Attendance Trend</h6>
            <ChartMount height={260}>
              {chartsReady && (
                <Line data={attendanceChart} options={{
                  ...baseChartOptions,
                  scales: {
                    x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                    y: { min: 0, max: 100, ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
                  },
                }} />
              )}
            </ChartMount>
          </div>
        </div>
      </div>
    </div>
  )
}