import { useEffect, useState, type FormEvent } from 'react'
import { Line } from 'react-chartjs-2'
import { HeartPulse, Moon, Battery, Activity, Plus, Smile } from 'lucide-react'
import '@/lib/chartSetup'
import { axisChartOptions, CHART_PALETTE } from '@/lib/chartSetup'
import { trainingAPI, athletesAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { WellnessCheckInItem, SessionRPEItem, AthleteListItem } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'

const RATING_FIELDS: { key: 'sleep_quality' | 'fatigue' | 'soreness' | 'stress' | 'mood'; label: string }[] = [
  { key: 'sleep_quality', label: 'Sleep Quality' },
  { key: 'fatigue', label: 'Freshness (low fatigue)' },
  { key: 'soreness', label: 'Low Soreness' },
  { key: 'stress', label: 'Low Stress' },
  { key: 'mood', label: 'Mood' },
]

const todayStr = () => new Date().toISOString().split('T')[0]

function scoreVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 3.5) return 'success'
  if (score >= 2.5) return 'warning'
  return 'danger'
}

export default function AthleteMonitoring() {
  const { isStaff, user } = useAuth()
  const { showToast } = useToast()

  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('')
  const [wellness, setWellness] = useState<WellnessCheckInItem[]>([])
  const [rpeRecords, setRpeRecords] = useState<SessionRPEItem[]>([])
  const [loading, setLoading] = useState(true)

  const [wellnessForm, setWellnessForm] = useState({
    date: todayStr(), sleep_hours: '', sleep_quality: 3, fatigue: 3, soreness: 3, stress: 3, mood: 3, notes: '',
  })
  const [rpeForm, setRpeForm] = useState({ session_date: todayStr(), rpe: 5, duration_minutes: '', session_type: 'Training' })
  const [savingWellness, setSavingWellness] = useState(false)
  const [savingRpe, setSavingRpe] = useState(false)

  useEffect(() => {
    if (isStaff) athletesAPI.getAll().then((res) => setAthletes(parseListResponse(res.data))).catch(() => {})
  }, [isStaff])

  const load = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (isStaff && selectedAthleteId) params.athlete_id = selectedAthleteId
    Promise.all([
      trainingAPI.getWellness(isStaff && !selectedAthleteId ? {} : params),
      trainingAPI.getRpe(isStaff && !selectedAthleteId ? {} : params),
    ])
      .then(([wRes, rRes]) => {
        setWellness(parseListResponse(wRes.data))
        setRpeRecords(parseListResponse(rRes.data))
      })
      .catch(() => showToast('Failed to load monitoring data', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [isStaff, selectedAthleteId])

  const handleWellnessSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSavingWellness(true)
    try {
      await trainingAPI.createWellness({
        ...wellnessForm,
        sleep_hours: wellnessForm.sleep_hours || undefined,
        athlete: isStaff ? Number(selectedAthleteId) : undefined,
      })
      showToast('Check-in saved', 'success')
      load()
    } catch {
      showToast('Failed to save check-in (one per day per athlete)', 'error')
    } finally {
      setSavingWellness(false)
    }
  }

  const handleRpeSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!rpeForm.duration_minutes) return
    setSavingRpe(true)
    try {
      await trainingAPI.createRpe({
        ...rpeForm,
        duration_minutes: Number(rpeForm.duration_minutes),
        athlete: isStaff ? Number(selectedAthleteId) : undefined,
      })
      showToast('Session RPE logged', 'success')
      setRpeForm({ session_date: todayStr(), rpe: 5, duration_minutes: '', session_type: 'Training' })
      load()
    } catch {
      showToast('Failed to log RPE', 'error')
    } finally {
      setSavingRpe(false)
    }
  }

  const latestWellness = wellness[0]
  const recentWellness = [...wellness].reverse().slice(-14)
  const recentRpe = [...rpeRecords].reverse().slice(-14)

  const wellnessChart = {
    labels: recentWellness.map((w) => w.date),
    datasets: [{
      label: 'Wellness Score', data: recentWellness.map((w) => w.wellness_score),
      borderColor: CHART_PALETTE[0], backgroundColor: 'rgba(177,18,38,0.12)', fill: true, tension: 0.4, pointRadius: 0,
    }],
  }

  const loadChart = {
    labels: recentRpe.map((r) => r.session_date),
    datasets: [{
      label: 'Training Load', data: recentRpe.map((r) => r.training_load),
      borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.12)', fill: true, tension: 0.4, pointRadius: 0,
    }],
  }

  const canLog = !isStaff || Boolean(selectedAthleteId)

  return (
    <div>
      <PageHeader
        title={isStaff ? 'Athlete Monitoring' : 'My Wellness & RPE'}
        description={isStaff ? 'Team readiness — wellness check-ins and session training load' : 'Log your daily check-in and post-session RPE'}
      />

      {isStaff && (
        <div className="mb-6 max-w-xs">
          <Select label="Athlete" value={selectedAthleteId} onChange={(e) => setSelectedAthleteId(e.target.value)}>
            <option value="">Team overview</option>
            {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </Select>
        </div>
      )}

      {isStaff && !selectedAthleteId ? (
        <TeamOverview athletes={athletes} wellness={wellness} rpeRecords={rpeRecords} loading={loading} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Smile} label="Latest Wellness" value={latestWellness?.wellness_score || 0} decimals={1} accent />
            <StatCard icon={Moon} label="Sleep (hrs)" value={latestWellness?.sleep_hours ? Number(latestWellness.sleep_hours) : 0} decimals={1} />
            <StatCard icon={Battery} label="Fatigue Score" value={latestWellness?.fatigue || 0} />
            <StatCard icon={Activity} label="Check-ins Logged" value={wellness.length} />
          </div>

          {canLog && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 font-display text-base font-bold text-text">Daily Check-In</h3>
                <form onSubmit={handleWellnessSubmit}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input id="wellness_date" type="date" label="Date" value={wellnessForm.date} onChange={(e) => setWellnessForm({ ...wellnessForm, date: e.target.value })} required />
                    <Input id="sleep_hours" type="number" step="0.5" label="Sleep Hours" value={wellnessForm.sleep_hours} onChange={(e) => setWellnessForm({ ...wellnessForm, sleep_hours: e.target.value })} />
                  </div>
                  <div className="mt-4 space-y-3">
                    {RATING_FIELDS.map((f) => (
                      <div key={f.key}>
                        <div className="flex items-center justify-between">
                          <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">{f.label}</label>
                          <span className="font-body text-sm font-bold text-accent">{wellnessForm[f.key]}</span>
                        </div>
                        <input
                          type="range" min={1} max={5} value={wellnessForm[f.key]}
                          onChange={(e) => setWellnessForm({ ...wellnessForm, [f.key]: Number(e.target.value) })}
                          className="mt-2 w-full accent-accent"
                        />
                      </div>
                    ))}
                  </div>
                  <Button type="submit" size="sm" magnetic={false} className="mt-5 w-full" disabled={savingWellness}>
                    <Plus size={14} /> {savingWellness ? 'Saving...' : 'Save Check-In'}
                  </Button>
                </form>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 font-display text-base font-bold text-text">Log Session RPE</h3>
                <form onSubmit={handleRpeSubmit}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input id="rpe_date" type="date" label="Session Date" value={rpeForm.session_date} onChange={(e) => setRpeForm({ ...rpeForm, session_date: e.target.value })} required />
                    <Input id="rpe_duration" type="number" label="Duration (min) *" value={rpeForm.duration_minutes} onChange={(e) => setRpeForm({ ...rpeForm, duration_minutes: e.target.value })} required />
                    <Input id="rpe_type" label="Session Type" value={rpeForm.session_type} onChange={(e) => setRpeForm({ ...rpeForm, session_type: e.target.value })} />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <label className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">RPE (1 = very light, 10 = maximal)</label>
                      <span className="font-body text-sm font-bold text-accent">{rpeForm.rpe}</span>
                    </div>
                    <input type="range" min={1} max={10} value={rpeForm.rpe} onChange={(e) => setRpeForm({ ...rpeForm, rpe: Number(e.target.value) })} className="mt-2 w-full accent-accent" />
                  </div>
                  {rpeForm.duration_minutes && (
                    <p className="mt-3 font-body text-xs text-text-muted">Training load: {rpeForm.rpe * Number(rpeForm.duration_minutes)}</p>
                  )}
                  <Button type="submit" size="sm" magnetic={false} className="mt-5 w-full" disabled={savingRpe}>
                    <Plus size={14} /> {savingRpe ? 'Saving...' : 'Log RPE'}
                  </Button>
                </form>
              </Card>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Wellness Trend</CardTitle></CardHeader>
              <CardContent style={{ height: 260 }}>
                {recentWellness.length > 0 ? (
                  <Line data={wellnessChart} options={{ ...axisChartOptions, scales: { ...axisChartOptions.scales, y: { ...axisChartOptions.scales.y, min: 0, max: 5 } } }} />
                ) : <EmptyState icon={Smile} title="No check-ins yet" />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Training Load Trend</CardTitle></CardHeader>
              <CardContent style={{ height: 260 }}>
                {recentRpe.length > 0 ? (
                  <Line data={loadChart} options={axisChartOptions} />
                ) : <EmptyState icon={Activity} title="No RPE records yet" />}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader><CardTitle>Check-In History</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10"><Spinner size={24} /></div>
              ) : wellness.length === 0 ? (
                <EmptyState icon={HeartPulse} title="No check-ins logged yet" />
              ) : (
                <div className="space-y-2">
                  {wellness.slice(0, 10).map((w) => (
                    <div key={w.id} className="flex items-center justify-between rounded-xl border border-border bg-white/[0.03] px-4 py-3">
                      <div>
                        <p className="font-body text-sm font-semibold text-text">{w.date}</p>
                        <p className="font-body text-xs text-text-muted">
                          Sleep {w.sleep_hours || '—'}h · Fatigue {w.fatigue}/5 · Soreness {w.soreness}/5 · Stress {w.stress}/5 · Mood {w.mood}/5
                        </p>
                      </div>
                      <Badge variant={scoreVariant(w.wellness_score)}>{w.wellness_score}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function TeamOverview({
  athletes, wellness, rpeRecords, loading,
}: {
  athletes: AthleteListItem[]
  wellness: WellnessCheckInItem[]
  rpeRecords: SessionRPEItem[]
  loading: boolean
}) {
  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>
  if (athletes.length === 0) return <Card><EmptyState icon={HeartPulse} title="No athletes yet" /></Card>

  const latestFor = (athleteId: number) => wellness.filter((w) => w.athlete === athleteId)[0]
  const latestRpeFor = (athleteId: number) => rpeRecords.filter((r) => r.athlete === athleteId)[0]

  return (
    <Card className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {['Athlete', 'Latest Check-In', 'Wellness Score', 'Latest RPE', 'Training Load'].map((h) => (
              <th key={h} className="whitespace-nowrap px-5 py-3 text-left font-body text-[11px] font-semibold uppercase tracking-widest text-text-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {athletes.map((a) => {
            const w = latestFor(a.id)
            const r = latestRpeFor(a.id)
            return (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-body text-sm text-text">{a.full_name}</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{w?.date || '—'}</td>
                <td className="px-5 py-3">{w ? <Badge variant={scoreVariant(w.wellness_score)}>{w.wellness_score}</Badge> : <span className="font-body text-sm text-text-muted">—</span>}</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{r ? `${r.rpe}/10` : '—'}</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{r?.training_load ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
