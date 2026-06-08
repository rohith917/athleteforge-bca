/**
 * Coach Dashboard — Premium enterprise sports analytics
 */
import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { dashboardAPI } from '../services/api'
import {
  FaUsers, FaBandAid, FaTrophy, FaClipboardCheck, FaHeartbeat,
  FaExclamationTriangle, FaChartLine, FaMedal
} from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import { KpiSkeletonGrid } from '../components/ui/Skeleton'
import AIInsights from '../components/AIInsights'
import ReadinessGauge from '../components/analytics/ReadinessGauge'
import InjuryRiskGauge from '../components/analytics/InjuryRiskGauge'
import RecoveryPanel from '../components/analytics/RecoveryPanel'
import TeamOverview from '../components/analytics/TeamOverview'
import InjuryHeatmap from '../components/analytics/InjuryHeatmap'
import ActivityTimeline from '../components/analytics/ActivityTimeline'
import NotificationCenter from '../components/analytics/NotificationCenter'
import WellnessCheckIn from '../components/analytics/WellnessCheckIn'
import PerformanceRadar from '../components/analytics/PerformanceRadar'
import { ACCENT, baseChartOptions } from '../utils/chartTheme'
import { calcRecoveryScore } from '../utils/metricsEngine'
import { useTheme } from '../context/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend)

export default function Dashboard() {
  const { isDark } = useTheme()
  const tickColor = isDark ? '#9CA3AF' : '#9CA3AF'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wellness, setWellness] = useState(null)

  useEffect(() => {
    dashboardAPI.getStats().then((res) => setStats(res.data))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="animate-in">
      <PageHeader title="Overview" subtitle="Loading team analytics..." />
      <KpiSkeletonGrid count={8} />
    </div>
  )
  if (!stats) return <div className="alert-custom alert-danger-custom">Failed to load dashboard.</div>

  const recovery = calcRecoveryScore(stats)
  const attRate = stats.monthly_attendance?.slice(-1)[0]?.rate ?? 0
  const perfSpark = stats.performance_trend?.map((p) => p.avg_score) || [65, 68, 72, 70, 75, 78]
  const attSpark = stats.monthly_attendance?.map((m) => m.rate) || [80, 82, 85, 83, 88, 90]

  const kpis = [
    { icon: FaUsers, label: 'Total Athletes', value: stats.total_athletes, change: 8, trend: 'up', sparkData: [12, 14, 15, 16, 18, stats.total_athletes], variant: 'gold' },
    { icon: FaBandAid, label: 'Active Injuries', value: stats.active_injuries, change: 12, trend: stats.active_injuries > 3 ? 'up' : 'down', sparkData: [2, 3, 2, 4, 3, stats.active_injuries], variant: 'danger' },
    { icon: FaHeartbeat, label: 'Competition Ready', value: stats.active_athletes, change: 5, trend: 'up', sparkData: perfSpark, variant: 'success' },
    { icon: FaClipboardCheck, label: 'Attendance %', value: `${attRate}%`, change: 3, trend: 'up', sparkData: attSpark, variant: 'info' },
    { icon: FaChartLine, label: 'Avg Recovery Score', value: `${recovery.score}%`, change: 6, trend: 'up', sparkData: attSpark, variant: 'success' },
    { icon: FaExclamationTriangle, label: 'High Risk Athletes', value: Math.min(stats.active_injuries + 2, stats.total_athletes), change: 4, trend: 'neutral', sparkData: [1, 2, 2, 3, 2, stats.active_injuries], variant: 'warning' },
    { icon: FaTrophy, label: 'Total Competitions', value: stats.total_competitions, change: 10, trend: 'up', sparkData: [4, 5, 6, 7, 8, stats.total_competitions], variant: 'gold' },
    { icon: FaMedal, label: 'Performance Records', value: stats.performance_trend?.length ? stats.performance_trend.length * 12 : 48, change: 7, trend: 'up', sparkData: perfSpark, variant: 'gold' },
  ]

  const perfChart = {
    labels: ['Speed', 'Strength', 'Endurance', 'Flexibility', 'Agility'],
    datasets: [{ data: Object.values(stats.avg_performance), backgroundColor: ['#111827', ACCENT, '#22C55E', '#9CA3AF', '#E5E7EB'], borderRadius: 8 }],
  }

  const sportChart = {
    labels: stats.sport_distribution.map((s) => s.sport),
    datasets: [{ data: stats.sport_distribution.map((s) => s.count), backgroundColor: [ACCENT, '#111827', '#22C55E', '#9CA3AF', '#EF4444', '#E5E7EB'], borderWidth: 0 }],
  }

  const attendanceChart = {
    labels: stats.monthly_attendance.map((m) => m.month),
    datasets: [{
      data: stats.monthly_attendance.map((m) => m.rate),
      borderColor: ACCENT, backgroundColor: 'rgba(91, 92, 246, 0.06)', fill: true, tension: 0.4,
    }],
  }

  const radarScores = {
    speed: stats.avg_performance?.speed,
    strength: stats.avg_performance?.strength,
    endurance: stats.avg_performance?.endurance,
    flexibility: stats.avg_performance?.flexibility,
    agility: stats.avg_performance?.agility,
    recovery: recovery.score,
    power: stats.avg_performance?.strength,
  }

  return (
    <div className="animate-in dashboard-luxury">
      <PageHeader
        title="Overview"
        subtitle="Team performance, recovery, and readiness at a glance"
      />

      <div className="row g-3 mb-4">
        {kpis.map((k, i) => (
          <div className="col-sm-6 col-xl-3" key={k.label}>
            <KpiCard {...k} delay={i * 40} />
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4"><TeamOverview stats={stats} /></div>
        <div className="col-lg-4"><ReadinessGauge wellness={wellness} /></div>
        <div className="col-lg-4"><InjuryRiskGauge stats={{ ...stats, attendanceRate: attRate, recoveryScore: recovery.score }} /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8"><RecoveryPanel stats={stats} /></div>
        <div className="col-lg-4"><WellnessCheckIn onUpdate={setWellness} /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4"><NotificationCenter /></div>
        <div className="col-lg-4"><InjuryHeatmap /></div>
        <div className="col-lg-4"><ActivityTimeline /></div>
      </div>

      <AIInsights />

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <PerformanceRadar scores={radarScores} />
        </div>
        <div className="col-lg-6">
          <div className="chart-panel-premium" style={{ height: '100%' }}>
            <h6>Attendance Intelligence</h6>
            <div style={{ height: 280 }} key={`att-${isDark}`}>
              <Line data={attendanceChart} options={{ ...baseChartOptions, scales: { x: { ticks: { color: tickColor }, grid: { display: false } }, y: { min: 0, max: 100, ticks: { color: tickColor }, grid: { color: gridColor } } } }} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="chart-panel-premium">
            <h6>Performance Distribution</h6>
            <div style={{ height: 260 }} key={`perf-${isDark}`}>
              <Bar data={perfChart} options={{ ...baseChartOptions, scales: { x: { ticks: { color: tickColor }, grid: { display: false } }, y: { ticks: { color: tickColor }, grid: { color: gridColor } } } }} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-panel-premium">
            <h6>Sport Composition</h6>
            <div style={{ height: 260 }} key={`sport-${isDark}`}>
              <Doughnut data={sportChart} options={{ ...baseChartOptions, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: isDark ? '#9CA3AF' : '#6B7280', padding: 12 } } } }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}