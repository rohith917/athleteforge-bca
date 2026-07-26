import { useEffect, useState, type FormEvent } from 'react'
import { Line } from 'react-chartjs-2'
import { Activity, Plus, Ruler, Trash2 } from 'lucide-react'
import '@/lib/chartSetup'
import { axisChartOptions, CHART_PALETTE } from '@/lib/chartSetup'
import { trainingAPI, athletesAPI } from '@/services/api'
import { parseListResponse } from '@/lib/apiHelpers'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { AthleteListItem, TestProtocol, TestResultItem } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'

const todayStr = () => new Date().toISOString().split('T')[0]

export default function PerformanceTesting() {
  const { isStaff } = useAuth()
  const { showToast } = useToast()

  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState('')
  const [protocols, setProtocols] = useState<TestProtocol[]>([])
  const [results, setResults] = useState<TestResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [chartProtocolId, setChartProtocolId] = useState('')

  const [form, setForm] = useState({ protocol: '', test_date: todayStr(), value: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isStaff) athletesAPI.getAll().then((res) => setAthletes(parseListResponse(res.data))).catch(() => {})
    trainingAPI.getTestProtocols().then((res) => setProtocols(parseListResponse(res.data))).catch(() => {})
  }, [isStaff])

  const load = () => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (isStaff && selectedAthleteId) params.athlete_id = selectedAthleteId
    trainingAPI.getTestResults(isStaff && !selectedAthleteId ? {} : params)
      .then((res) => setResults(parseListResponse(res.data)))
      .catch(() => showToast('Failed to load test results', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [isStaff, selectedAthleteId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.protocol || !form.value) return
    setSaving(true)
    try {
      await trainingAPI.createTestResult({
        protocol: Number(form.protocol),
        test_date: form.test_date,
        value: form.value,
        notes: form.notes,
        athlete: isStaff ? Number(selectedAthleteId) : undefined,
      })
      showToast('Test result recorded', 'success')
      setForm({ protocol: '', test_date: todayStr(), value: '', notes: '' })
      load()
    } catch {
      showToast('Failed to record test result', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this test result?')) return
    try {
      await trainingAPI.deleteTestResult(id)
      setResults((prev) => prev.filter((r) => r.id !== id))
      showToast('Test result deleted', 'success')
    } catch {
      showToast('Failed to delete test result', 'error')
    }
  }

  // Physical testing is coach-administered (unlike self-reported wellness/RPE) —
  // the backend restricts TestResult writes to coach/admin, so students only
  // ever get a read-only view of their own history here.
  const canLog = isStaff && Boolean(selectedAthleteId)
  const chartProtocol = protocols.find((p) => String(p.id) === chartProtocolId)
  const chartResults = [...results]
    .filter((r) => String(r.protocol) === chartProtocolId)
    .sort((a, b) => a.test_date.localeCompare(b.test_date))

  const chartData = {
    labels: chartResults.map((r) => r.test_date),
    datasets: [{
      label: chartProtocol?.name || 'Result',
      data: chartResults.map((r) => Number(r.value)),
      borderColor: CHART_PALETTE[0], backgroundColor: 'rgba(177,18,38,0.12)', fill: true, tension: 0.4, pointRadius: 3,
    }],
  }

  return (
    <div>
      <PageHeader
        title={isStaff ? 'Performance Testing' : 'My Test Results'}
        description={isStaff ? 'Record and track standardized physical test results over time' : 'Your recorded test results across standardized protocols'}
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
        <TeamOverview athletes={athletes} results={results} loading={loading} />
      ) : (
        <>
          {canLog && (
            <Card className="mb-6 p-6">
              <h3 className="mb-4 font-display text-base font-bold text-text">Record a Test Result</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Select label="Protocol *" value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })} required>
                    <option value="">Select a test</option>
                    {protocols.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                  </Select>
                  <Input id="test_date" type="date" label="Test Date *" value={form.test_date} onChange={(e) => setForm({ ...form, test_date: e.target.value })} required />
                  <Input id="test_value" type="number" step="0.01" label="Value *" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
                  <Input id="test_notes" label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                <Button type="submit" size="sm" magnetic={false} className="mt-4" disabled={saving}>
                  <Plus size={14} /> {saving ? 'Saving...' : 'Record Result'}
                </Button>
              </form>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Trend</CardTitle>
              <Select value={chartProtocolId} onChange={(e) => setChartProtocolId(e.target.value)} className="mt-0 max-w-[220px]">
                <option value="">Choose a test to chart</option>
                {protocols.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </CardHeader>
            <CardContent style={{ height: 260 }}>
              {!chartProtocolId ? (
                <EmptyState icon={Activity} title="Choose a test above to see its trend" />
              ) : chartResults.length === 0 ? (
                <EmptyState icon={Activity} title="No results recorded for this test yet" />
              ) : (
                <Line data={chartData} options={axisChartOptions} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Test History</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10"><Spinner size={24} /></div>
              ) : results.length === 0 ? (
                <EmptyState icon={Ruler} title="No test results recorded yet" />
              ) : (
                <div className="space-y-2">
                  {results.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-white/[0.03] px-4 py-3">
                      <div>
                        <p className="font-body text-sm font-semibold text-text">{r.protocol_name}</p>
                        <p className="font-body text-xs text-text-muted">
                          {r.test_date} · {r.value} {r.protocol_unit}
                          {r.recorded_by_name ? ` · recorded by ${r.recorded_by_name}` : ''}
                          {r.notes ? ` · ${r.notes}` : ''}
                        </p>
                      </div>
                      {isStaff && (
                        <button onClick={() => handleDelete(r.id)} className="text-text-muted hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      )}
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
  athletes, results, loading,
}: {
  athletes: AthleteListItem[]
  results: TestResultItem[]
  loading: boolean
}) {
  if (loading) return <div className="flex justify-center py-16"><Spinner size={28} /></div>
  if (athletes.length === 0) return <Card><EmptyState icon={Ruler} title="No athletes yet" /></Card>

  const countFor = (athleteId: number) => results.filter((r) => r.athlete === athleteId).length
  const latestFor = (athleteId: number) => results.filter((r) => r.athlete === athleteId)[0]

  return (
    <Card className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {['Athlete', 'Tests Recorded', 'Most Recent Test', 'Date'].map((h) => (
              <th key={h} className="whitespace-nowrap px-5 py-3 text-left font-body text-[11px] font-semibold uppercase tracking-widest text-text-muted">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {athletes.map((a) => {
            const latest = latestFor(a.id)
            return (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-body text-sm text-text">{a.full_name}</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{countFor(a.id)}</td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">
                  {latest ? `${latest.protocol_name} — ${latest.value} ${latest.protocol_unit}` : '—'}
                </td>
                <td className="px-5 py-3 font-body text-sm text-text-secondary">{latest?.test_date || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
