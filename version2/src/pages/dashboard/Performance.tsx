import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { Line, Radar } from 'react-chartjs-2'
import { Plus, Trash2, TrendingUp, Zap, Activity } from 'lucide-react'
import '@/lib/chartSetup'
import { axisChartOptions, CHART_PALETTE } from '@/lib/chartSetup'
import { performanceAPI, athletesAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { Performance as PerformanceRecord, AthleteListItem, PerformanceDashboardData } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { SearchFilterBar } from '@/components/dashboard/SearchFilterBar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'

const METRICS = ['speed_score', 'strength_score', 'endurance_score', 'flexibility_score', 'agility_score'] as const
const LINE_COLORS = [CHART_PALETTE[0], '#22c55e', '#60a5fa', '#f59e0b', '#a855f7']

const emptyForm = {
  athlete: '', record_date: new Date().toISOString().split('T')[0],
  speed_score: '', strength_score: '', endurance_score: '', flexibility_score: '', agility_score: '', notes: '',
}

export default function Performance() {
  const [records, setRecords] = useState<PerformanceRecord[]>([])
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [chartData, setChartData] = useState<PerformanceDashboardData | null>(null)
  const [filterAthlete, setFilterAthlete] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { isStaff, isStudent, user } = useAuth()
  const { showToast } = useToast()
  const debouncedSearch = useDebouncedValue(search)

  useEffect(() => {
    if (isStudent && user?.athlete_id) setFilterAthlete(String(user.athlete_id))
  }, [isStudent, user?.athlete_id])

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params: Record<string, string> = {}
      if (filterAthlete) params.athlete_id = filterAthlete
      if (debouncedSearch) params.search = debouncedSearch
      const [perfRes, athRes, dashRes] = await Promise.all([
        performanceAPI.getAll(params),
        athletesAPI.getAll(),
        performanceAPI.getDashboard(params),
      ])
      setRecords(parseListResponse(perfRes.data))
      setAthletes(parseListResponse(athRes.data))
      setChartData(dashRes.data as PerformanceDashboardData)
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'performance data'))
      showToast('Failed to load performance data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [filterAthlete, debouncedSearch])

  const avgScores = useMemo(() => {
    if (!records.length) return { speed: 0, strength: 0, endurance: 0, flexibility: 0, agility: 0 }
    const sums = { speed_score: 0, strength_score: 0, endurance_score: 0, flexibility_score: 0, agility_score: 0 }
    records.forEach((r) => METRICS.forEach((m) => { sums[m] += Number(r[m] || 0) }))
    const n = records.length
    return {
      speed: Math.round(sums.speed_score / n),
      strength: Math.round(sums.strength_score / n),
      endurance: Math.round(sums.endurance_score / n),
      flexibility: Math.round(sums.flexibility_score / n),
      agility: Math.round(sums.agility_score / n),
    }
  }, [records])

  const overallAvg = Math.round((avgScores.speed + avgScores.strength + avgScores.endurance + avgScores.flexibility + avgScores.agility) / 5)
  const topSpeed = Math.max(...records.map((r) => r.speed_score || 0), 0)
  const topStrength = Math.max(...records.map((r) => r.strength_score || 0), 0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await performanceAPI.create({
        athlete: Number(form.athlete),
        record_date: form.record_date,
        notes: form.notes,
        speed_score: form.speed_score ? Number(form.speed_score) : null,
        strength_score: form.strength_score ? Number(form.strength_score) : null,
        endurance_score: form.endurance_score ? Number(form.endurance_score) : null,
        flexibility_score: form.flexibility_score ? Number(form.flexibility_score) : null,
        agility_score: form.agility_score ? Number(form.agility_score) : null,
      })
      showToast('Performance recorded successfully', 'success')
      setForm(emptyForm)
      setShowForm(false)
      fetchData()
    } catch {
      showToast('Failed to record performance', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this record?')) return
    await performanceAPI.delete(id)
    showToast('Record deleted', 'success')
    fetchData()
  }

  const radarData = {
    labels: ['Speed', 'Strength', 'Endurance', 'Flexibility', 'Agility'],
    datasets: [{
      label: 'Average',
      data: [avgScores.speed, avgScores.strength, avgScores.endurance, avgScores.flexibility, avgScores.agility],
      backgroundColor: 'rgba(177,18,38,0.2)',
      borderColor: CHART_PALETTE[0],
      pointBackgroundColor: CHART_PALETTE[0],
    }],
  }

  const lineData = chartData ? {
    labels: chartData.labels,
    datasets: (['speed', 'strength', 'endurance', 'flexibility', 'agility'] as const).map((k, i) => ({
      label: k.charAt(0).toUpperCase() + k.slice(1),
      data: chartData[k],
      borderColor: LINE_COLORS[i],
      backgroundColor: LINE_COLORS[i],
      tension: 0.4,
      pointRadius: 0,
    })),
  } : null

  return (
    <div>
      <PageHeader
        title={isStudent ? 'My Performance' : 'Performance Analytics'}
        description={isStudent ? 'Your training scores, trends, and readiness' : 'Speed · Strength · Power · Endurance · Agility'}
        actions={isStaff ? (
          <Button size="sm" magnetic={false} onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} /> Record Performance
          </Button>
        ) : undefined}
      />

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={fetchData} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      {!isStudent && (
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by athlete or notes..."
          filters={[{
            key: 'athlete',
            value: filterAthlete,
            onChange: setFilterAthlete,
            placeholder: 'All Athletes',
            options: athletes.map((a) => ({ value: String(a.id), label: a.full_name })),
          }]}
        />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Activity} label="Total Records" value={records.length} accent />
        <StatCard icon={TrendingUp} label="Avg Performance" value={overallAvg} suffix="%" />
        <StatCard icon={Zap} label="Top Speed" value={topSpeed} />
        <StatCard icon={Zap} label="Top Strength" value={topStrength} />
      </div>

      {isStaff && showForm && (
        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">New Performance Record</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select label="Athlete *" value={form.athlete} onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                <option value="">Select Athlete</option>
                {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </Select>
              <Input id="record_date" type="date" label="Date *" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} required />
              {METRICS.map((f) => (
                <Input
                  key={f}
                  id={f}
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  label={`${f.replace('_score', '').toUpperCase()} (0-100)`}
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                />
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false}>Save Record</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Performance Profile</CardTitle></CardHeader>
          <CardContent style={{ height: 300 }}>
            <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { color: '#9ca3af', backdropColor: 'transparent' }, grid: { color: 'rgba(255,255,255,0.08)' }, angleLines: { color: 'rgba(255,255,255,0.08)' }, pointLabels: { color: '#ffffff', font: { size: 11 } } } }, plugins: { legend: { display: false } } }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Performance Trends</CardTitle></CardHeader>
          <CardContent style={{ height: 300 }}>
            {lineData && (
              <Line data={lineData} options={{ ...axisChartOptions, scales: { ...axisChartOptions.scales, y: { ...axisChartOptions.scales.y, min: 0, max: 100 } }, plugins: { ...axisChartOptions.plugins, legend: { display: true, position: 'bottom', labels: { color: '#9ca3af', boxWidth: 10, font: { size: 11 } } } } }} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Performance History</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size={24} /></div>
          ) : records.length === 0 ? (
            <EmptyState icon={Activity} title="No performance records yet" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {records.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-body text-sm font-semibold text-text">{r.athlete_name}</p>
                      <p className="font-body text-xs text-text-muted">{r.record_date}</p>
                    </div>
                    {isStaff && (
                      <button onClick={() => handleDelete(r.id)} className="text-text-muted hover:text-accent-hover">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {METRICS.map((m) => (
                      <div key={m} className="text-center">
                        <div className="font-display text-sm font-bold text-text">{r[m] ?? '—'}</div>
                        <div className="mt-0.5 font-body text-[9px] uppercase text-text-muted">{m.replace('_score', '')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
