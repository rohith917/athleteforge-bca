import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Plus, Trash2, Trophy, Medal } from 'lucide-react'
import '@/lib/chartSetup'
import { axisChartOptions, donutLegendOptions } from '@/lib/chartSetup'
import { competitionsAPI, athletesAPI } from '@/services/api'
import { parseListResponse, getLoadErrorMessage } from '@/lib/apiHelpers'
import { useToast } from '@/context/ToastContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { Competition, AthleteListItem, CompetitionLevel, Medal as MedalType, MedalCounts } from '@/types'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { SearchFilterBar } from '@/components/dashboard/SearchFilterBar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Badge } from '@/components/ui/Badge'

const emptyComp = { name: '', sport: '', venue: '', competition_date: new Date().toISOString().split('T')[0], level: 'Local' as CompetitionLevel, description: '' }
const emptyResult = { athlete: '', position: '', medal: 'None' as MedalType, score: '' }
const MEDAL_VARIANT = { Gold: 'accent', Silver: 'default', Bronze: 'warning', None: 'default' } as const

export default function Competitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [athletes, setAthletes] = useState<AthleteListItem[]>([])
  const [medals, setMedals] = useState<MedalCounts | null>(null)
  const [compForm, setCompForm] = useState(emptyComp)
  const [resultForm, setResultForm] = useState(emptyResult)
  const [selectedComp, setSelectedComp] = useState<number | null>(null)
  const [showCompForm, setShowCompForm] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { showToast } = useToast()
  const debouncedSearch = useDebouncedValue(search)

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const params: Record<string, string> = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (levelFilter) params.level = levelFilter
      const [compRes, athRes, medalRes] = await Promise.all([
        competitionsAPI.getAll(params),
        athletesAPI.getAll(),
        competitionsAPI.getMedals(),
      ])
      setCompetitions(parseListResponse(compRes.data))
      setAthletes(parseListResponse(athRes.data))
      setMedals(medalRes.data)
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'competitions'))
      showToast('Failed to load competitions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [debouncedSearch, levelFilter])

  const allResults = useMemo(
    () => competitions.flatMap((c) => c.results || []),
    [competitions],
  )

  const winRate = useMemo(() => {
    if (!allResults.length) return 0
    const wins = allResults.filter((r) => r.medal === 'Gold' || (r.position != null && r.position <= 3)).length
    return Math.round((wins / allResults.length) * 100)
  }, [allResults])

  const medalChart = medals ? {
    labels: ['Gold', 'Silver', 'Bronze'],
    datasets: [{ data: [medals.gold, medals.silver, medals.bronze], backgroundColor: ['#f5b301', '#c0c0c0', '#cd7f32'], borderWidth: 0 }],
  } : null

  const medalBarChart = medals ? {
    labels: ['Gold', 'Silver', 'Bronze', 'Total'],
    datasets: [{ data: [medals.gold, medals.silver, medals.bronze, medals.total], backgroundColor: ['#f5b301', '#c0c0c0', '#cd7f32', '#22c55e'], borderRadius: 6, maxBarThickness: 42 }],
  } : null

  const handleCompSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await competitionsAPI.create(compForm)
    showToast('Competition added', 'success')
    setCompForm(emptyComp)
    setShowCompForm(false)
    fetchData()
  }

  const handleResultSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedComp) return
    await competitionsAPI.addResult(selectedComp, { ...resultForm, athlete: Number(resultForm.athlete), position: resultForm.position ? Number(resultForm.position) : null })
    showToast('Result saved', 'success')
    setResultForm(emptyResult)
    setShowResultForm(false)
    fetchData()
  }

  const handleDeleteComp = async (id: number) => {
    if (!window.confirm('Delete this competition?')) return
    await competitionsAPI.delete(id)
    showToast('Deleted', 'success')
    fetchData()
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Competition Analytics" description="Loading..." />
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Competition Analytics"
        description="Events · Results · Medals · Rankings · Win rate"
        actions={<Button size="sm" magnetic={false} onClick={() => setShowCompForm((v) => !v)}><Plus size={16} /> Add Competition</Button>}
      />

      {loadError && (
        <Card className="mb-6 flex items-center justify-between p-4">
          <p className="font-body text-sm text-accent-hover">{loadError}</p>
          <button onClick={fetchData} className="font-body text-xs font-semibold uppercase text-accent hover:text-accent-hover">Retry</button>
        </Card>
      )}

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search competitions..."
        filters={[{
          key: 'level',
          value: levelFilter,
          onChange: setLevelFilter,
          placeholder: 'All Levels',
          options: [
            { value: 'Local', label: 'Local' },
            { value: 'State', label: 'State' },
            { value: 'National', label: 'National' },
            { value: 'International', label: 'International' },
          ],
        }]}
      />

      {medals && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Medal} label="Gold Medals" value={medals.gold} accent />
          <StatCard icon={Medal} label="Silver Medals" value={medals.silver} />
          <StatCard icon={Medal} label="Bronze Medals" value={medals.bronze} />
          <StatCard icon={Trophy} label="Win Rate" value={winRate} suffix="%" />
        </div>
      )}

      {medalChart && medalBarChart && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Medal Distribution</CardTitle></CardHeader>
            <CardContent style={{ height: 240 }}><Doughnut data={medalChart} options={donutLegendOptions} /></CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Medal Trends</CardTitle></CardHeader>
            <CardContent style={{ height: 240 }}><Bar data={medalBarChart} options={axisChartOptions} /></CardContent>
          </Card>
        </div>
      )}

      {showCompForm && (
        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">New Competition</h3>
          <form onSubmit={handleCompSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input id="comp_name" label="Name *" value={compForm.name} onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} required />
              </div>
              <Input id="comp_sport" label="Sport *" value={compForm.sport} onChange={(e) => setCompForm({ ...compForm, sport: e.target.value })} required />
              <Select label="Level" value={compForm.level} onChange={(e) => setCompForm({ ...compForm, level: e.target.value as CompetitionLevel })}>
                <option>Local</option><option>State</option><option>National</option><option>International</option>
              </Select>
              <Input id="comp_date" type="date" label="Date *" value={compForm.competition_date} onChange={(e) => setCompForm({ ...compForm, competition_date: e.target.value })} required />
              <Input id="comp_venue" label="Venue" value={compForm.venue} onChange={(e) => setCompForm({ ...compForm, venue: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false}>Save</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowCompForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {showResultForm && selectedComp && (
        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-display text-base font-bold text-text">Add Result</h3>
          <form onSubmit={handleResultSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Select label="Athlete *" value={resultForm.athlete} onChange={(e) => setResultForm({ ...resultForm, athlete: e.target.value })} required>
                <option value="">Select</option>
                {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
              </Select>
              <Input id="res_position" type="number" label="Position" value={resultForm.position} onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })} />
              <Select label="Medal" value={resultForm.medal} onChange={(e) => setResultForm({ ...resultForm, medal: e.target.value as MedalType })}>
                <option value="None">None</option><option value="Gold">Gold</option><option value="Silver">Silver</option><option value="Bronze">Bronze</option>
              </Select>
              <Input id="res_score" label="Score" value={resultForm.score} onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })} />
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" size="sm" magnetic={false}>Save Result</Button>
              <Button type="button" variant="outline" size="sm" magnetic={false} onClick={() => setShowResultForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {competitions.length === 0 ? (
          <Card><EmptyState icon={Trophy} title="No competitions yet" /></Card>
        ) : competitions.map((comp) => (
          <Card key={comp.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-text">{comp.name}</h3>
                <p className="mt-1 font-body text-xs text-text-muted">{comp.sport} · {comp.level} · {comp.competition_date} · {comp.venue || 'TBD'}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" magnetic={false} onClick={() => { setSelectedComp(comp.id); setShowResultForm(true) }}>Add Result</Button>
                <button onClick={() => handleDeleteComp(comp.id)} className="flex size-9 items-center justify-center rounded-lg border border-border-strong text-text-muted hover:text-accent-hover">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {comp.results?.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {comp.results.map((r) => (
                  <div key={r.id} className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-2">
                    <strong className="font-body text-xs font-semibold text-text">{r.athlete_name}</strong>
                    <Badge variant={MEDAL_VARIANT[r.medal]}>{r.medal !== 'None' ? r.medal : `#${r.position ?? '—'}`}</Badge>
                    {r.score && <span className="font-body text-xs text-text-muted">{r.score}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 font-body text-xs text-text-muted">No results recorded yet.</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
