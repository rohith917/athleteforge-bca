/**
 * Coach Dashboard — navy/cyan analytics with AI insights.
 */
import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { dashboardAPI } from '../services/api'
import { FaUsers, FaBandAid, FaTrophy, FaMedal, FaChartLine } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import AIInsights from '../components/AIInsights'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

ChartJS.defaults.color = '#94a3b8'
ChartJS.defaults.borderColor = '#2d3a4f'

const chartOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
  scales: {
    x: { grid: { color: '#2d3a4f' }, ticks: { color: '#94a3b8' } },
    y: { grid: { color: '#2d3a4f' }, ticks: { color: '#94a3b8' } },
  },
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getStats().then(res => setStats(res.data))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner message="Loading AthleteForge dashboard..." fullScreen />
  if (!stats) return <div className="alert-custom alert-danger-custom">Failed to load dashboard.</div>

  const CYAN = '#00D4FF'
  const colors = [CYAN, '#00A8CC', '#22c55e', '#3b82f6', '#C9A962']

  const perfChart = {
    labels: ['Speed', 'Strength', 'Endurance', 'Flexibility', 'Agility'],
    datasets: [{ label: 'Avg Score', data: Object.values(stats.avg_performance), backgroundColor: colors, borderRadius: 8 }],
  }

  const sportChart = {
    labels: stats.sport_distribution.map(s => s.sport),
    datasets: [{ data: stats.sport_distribution.map(s => s.count), backgroundColor: ['#00D4FF', '#122240', '#22c55e', '#3b82f6', '#ef4444', '#C9A962'], borderWidth: 0 }],
  }

  const attendanceChart = {
    labels: stats.monthly_attendance.map(m => m.month),
    datasets: [{
      label: 'Attendance %', data: stats.monthly_attendance.map(m => m.rate),
      borderColor: CYAN, backgroundColor: 'rgba(0,212,255,0.1)', fill: true, tension: 0.4,
      pointBackgroundColor: CYAN, pointRadius: 5,
    }],
  }

  const injuryChart = {
    labels: stats.injury_by_severity.map(i => i.severity),
    datasets: [{ data: stats.injury_by_severity.map(i => i.count), backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderRadius: 8 }],
  }

  return (
    <div className="animate-in">
      <PageHeader title="Dashboard" subtitle="AthleteForge analytics — Track. Recover. Perform." />

      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3"><StatCard icon={FaUsers} value={stats.total_athletes} label="Athletes" variant="primary" delay={0} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard icon={FaBandAid} value={stats.active_injuries} label="Active Injuries" variant="danger" delay={80} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard icon={FaTrophy} value={stats.total_competitions} label="Competitions" variant="success" delay={160} /></div>
        <div className="col-sm-6 col-xl-3"><StatCard icon={FaMedal} value={stats.gold_medals + stats.silver_medals + stats.bronze_medals} label="Medals Won" variant="gold" delay={240} /></div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { val: stats.gold_medals, label: 'Gold', icon: FaMedal },
          { val: stats.silver_medals, label: 'Silver', icon: FaMedal },
          { val: stats.bronze_medals, label: 'Bronze', icon: FaChartLine },
        ].map((m, i) => (
          <div className="col-md-4" key={m.label}>
            <div className="stat-card animate-in" style={{ animationDelay: `${300 + i * 60}ms` }}>
              <div className="stat-icon-wrap"><m.icon /></div>
              <div className="stat-body">
                <h3 className="stat-value">{m.val}</h3>
                <p className="stat-label">{m.label} Medals</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AIInsights />

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="chart-panel animate-in" style={{ animationDelay: '480ms' }}>
            <h6>Performance Scores</h6>
            <Bar data={perfChart} options={{ ...chartOpts, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-panel animate-in" style={{ animationDelay: '540ms' }}>
            <h6>Athletes by Sport</h6>
            <Doughnut data={sportChart} options={{ ...chartOpts, cutout: '65%' }} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-panel animate-in" style={{ animationDelay: '600ms' }}>
            <h6>Attendance Rate</h6>
            <Line data={attendanceChart} options={{ ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, max: 100 } } }} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="chart-panel animate-in" style={{ animationDelay: '660ms' }}>
            <h6>Injury Severity</h6>
            <Bar data={injuryChart} options={{ ...chartOpts, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    </div>
  )
}