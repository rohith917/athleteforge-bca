import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Users, HeartPulse, Trophy, ClipboardCheck, TrendingUp, ShieldAlert,
  Medal, ArrowUpRight, UserX,
} from 'lucide-react'
import '@/lib/chartSetup'
import { axisChartOptions, donutLegendOptions, CHART_PALETTE } from '@/lib/chartSetup'
import { useAuth } from '@/context/AuthContext'
import { dashboardAPI, leaderboardAPI, announcementsAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import type { DashboardStats, LeaderboardEntry, Announcement } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { FullScreenLoader } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'

export default function DashboardHome() {
  const { user, isAdmin, isCoach, isStudent } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, leaderRes, annRes] = await Promise.all([
        dashboardAPI.getStats(),
        leaderboardAPI.get().catch(() => ({ data: { leaderboard: [], sports: [] } })),
        announcementsAPI.getAll().catch(() => ({ data: [] })),
      ])
      setStats(statsRes.data)
      setLeaders((leaderRes.data.leaderboard || []).slice(0, 5))
      setAnnouncements(parseListResponse<Announcement>(annRes.data).slice(0, 4))
    } catch (err) {
      setError(getLoadErrorMessage(err, 'dashboard'))
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <FullScreenLoader message="Loading your dashboard..." />

  if (!stats) {
    return (
      <div>
        <PageHeader title="Overview" />
        <Card className="p-6">
          <p className="font-body text-sm text-accent-hover">{error || 'Failed to load dashboard.'}</p>
          <button onClick={load} className="mt-3 font-body text-xs font-semibold uppercase tracking-widest text-accent hover:text-accent-hover">
            Retry
          </button>
        </Card>
      </div>
    )
  }

  if (stats.role === 'student' && stats.linked === false) {
    return (
      <div>
        <PageHeader title={`Welcome, ${user?.first_name || user?.username}`} />
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <UserX size={32} className="text-text-muted" />
          <p className="max-w-md font-body text-sm text-text-secondary">
            {stats.message || 'Your account is not linked to an athlete profile yet.'}
          </p>
        </Card>
      </div>
    )
  }

  const avgPerf = stats.avg_performance || {}
  const attRate = stats.monthly_attendance?.slice(-1)[0]?.rate ?? 0
  const totalMedals = (stats.gold_medals || 0) + (stats.silver_medals || 0) + (stats.bronze_medals || 0)

  const perfChart = {
    labels: ['Speed', 'Strength', 'Endurance', 'Flexibility', 'Agility'],
    datasets: [{
      data: [avgPerf.speed ?? 0, avgPerf.strength ?? 0, avgPerf.endurance ?? 0, avgPerf.flexibility ?? 0, avgPerf.agility ?? 0],
      backgroundColor: CHART_PALETTE[0],
      borderRadius: 6,
      maxBarThickness: 42,
    }],
  }

  const sportDist = stats.sport_distribution || []
  const sportChart = {
    labels: sportDist.length ? sportDist.map((s) => s.sport) : ['No data'],
    datasets: [{
      data: sportDist.length ? sportDist.map((s) => s.count) : [1],
      backgroundColor: CHART_PALETTE,
      borderWidth: 0,
    }],
  }

  const monthlyAtt = stats.monthly_attendance || []
  const attendanceChart = {
    labels: monthlyAtt.length ? monthlyAtt.map((m) => m.month) : ['—'],
    datasets: [{
      data: monthlyAtt.length ? monthlyAtt.map((m) => m.rate) : [0],
      borderColor: CHART_PALETTE[0],
      backgroundColor: 'rgba(177, 18, 38, 0.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }],
  }

  const roleTitle = isAdmin ? 'Admin Command Center' : isStudent ? 'My Performance Hub' : 'Team Analytics'

  return (
    <div>
      <PageHeader
        title={roleTitle}
        description={
          isStudent
            ? `${stats.athlete?.full_name || ''} · ${stats.athlete?.sport || ''}`
            : 'Roster overview · Performance · Injuries · Readiness'
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isStudent ? (
          <>
            <StatCard icon={TrendingUp} label="Avg Endurance" value={Math.round(avgPerf.endurance || 0)} suffix="%" accent />
            <StatCard icon={HeartPulse} label="Active Injuries" value={stats.active_injuries} />
            <StatCard icon={ClipboardCheck} label="Attendance" value={attRate} suffix="%" />
            <StatCard icon={Trophy} label="Medals Won" value={totalMedals} />
          </>
        ) : (
          <>
            <StatCard icon={Users} label="Total Athletes" value={stats.total_athletes} accent />
            <StatCard icon={HeartPulse} label="Active Injuries" value={stats.active_injuries} />
            <StatCard icon={ClipboardCheck} label="Attendance" value={attRate} suffix="%" />
            <StatCard icon={Trophy} label="Competitions" value={stats.total_competitions} />
          </>
        )}
      </div>

      {isAdmin && (
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={ShieldAlert} label="Total Users" value={stats.total_users || 0} />
          <StatCard icon={UserX} label="Unlinked Students" value={stats.unlinked_students || 0} />
          <StatCard icon={Medal} label="Total Medals" value={totalMedals} />
          <StatCard icon={TrendingUp} label="Performance Records" value={stats.total_performance_records || 0} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Performance Distribution</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <Bar data={perfChart} options={axisChartOptions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Attendance Trend</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <Line data={attendanceChart} options={{ ...axisChartOptions, scales: { ...axisChartOptions.scales, y: { ...axisChartOptions.scales.y, min: 0, max: 100 } } }} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {!isStudent && (
          <Card>
            <CardHeader><CardTitle>Sport Composition</CardTitle></CardHeader>
            <CardContent style={{ height: 260 }}>
              <Doughnut data={sportChart} options={donutLegendOptions} />
            </CardContent>
          </Card>
        )}

        <Card className={isStudent ? 'lg:col-span-2' : ''}>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <Link to="/dashboard/leaderboard" className="flex items-center gap-1 font-body text-xs font-semibold text-accent hover:text-accent-hover">
              View all <ArrowUpRight size={13} />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {leaders.length === 0 ? (
              <EmptyState icon={Medal} title="No leaderboard data yet" />
            ) : (
              <div className="divide-y divide-border">
                {leaders.map((l) => (
                  <div key={l.athlete_id} className="flex items-center gap-3 px-6 py-3.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/5 font-body text-xs font-bold text-text-secondary">
                      {l.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-sm font-semibold text-text">{l.name}</p>
                      <p className="truncate font-body text-xs text-text-muted">{l.sport}</p>
                    </div>
                    <span className="font-display text-sm font-bold text-accent">{l.composite_score}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
          <CardContent className="p-0">
            {announcements.length === 0 ? (
              <EmptyState icon={Users} title="No announcements" />
            ) : (
              <div className="divide-y divide-border">
                {announcements.map((a) => (
                  <div key={a.id} className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-body text-sm font-semibold text-text">{a.title}</p>
                      {a.pinned && <Badge variant="accent">Pinned</Badge>}
                    </div>
                    <p className="mt-1 line-clamp-2 font-body text-xs text-text-secondary">{a.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
