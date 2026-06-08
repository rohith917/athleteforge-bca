/**
 * Competition Analytics — medals, win rate, results
 */
import { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { competitionsAPI, athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaTrash, FaTrophy, FaMedal } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import { GOLD, MEDAL_GOLD, baseChartOptions } from '../utils/chartTheme'
import { Skeleton } from '../components/ui/Skeleton'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const emptyComp = { name: '', sport: '', venue: '', competition_date: new Date().toISOString().split('T')[0], level: 'Local', description: '' }
const emptyResult = { athlete: '', position: '', medal: 'None', score: '', notes: '' }

export default function Competitions() {
  const [competitions, setCompetitions] = useState([])
  const [athletes, setAthletes] = useState([])
  const [medals, setMedals] = useState(null)
  const [compForm, setCompForm] = useState(emptyComp)
  const [resultForm, setResultForm] = useState(emptyResult)
  const [selectedComp, setSelectedComp] = useState(null)
  const [showCompForm, setShowCompForm] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [compRes, athRes, medalRes] = await Promise.all([
        competitionsAPI.getAll(), athletesAPI.getAll(), competitionsAPI.getMedals(),
      ])
      setCompetitions(compRes.data.results || compRes.data)
      setAthletes(athRes.data.results || athRes.data)
      setMedals(medalRes.data)
    } catch { showToast('Failed to load competitions', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const allResults = useMemo(
    () => competitions.flatMap((c) => (c.results || []).map((r) => ({ ...r, compName: c.name }))),
    [competitions]
  )

  const winRate = useMemo(() => {
    if (!allResults.length) return 0
    const wins = allResults.filter((r) => r.medal === 'Gold' || (r.position && r.position <= 3)).length
    return Math.round((wins / allResults.length) * 100)
  }, [allResults])

  const medalChart = medals ? {
    labels: ['Gold', 'Silver', 'Bronze'],
    datasets: [{
      data: [medals.gold, medals.silver, medals.bronze],
      backgroundColor: [MEDAL_GOLD, '#C0C0C0', '#CD7F32'],
      borderWidth: 0,
    }],
  } : null

  const handleCompSubmit = async (e) => {
    e.preventDefault()
    await competitionsAPI.create(compForm)
    showToast('Competition added'); setCompForm(emptyComp); setShowCompForm(false); fetchData()
  }

  const handleResultSubmit = async (e) => {
    e.preventDefault()
    await competitionsAPI.addResult(selectedComp, resultForm)
    showToast('Result saved'); setResultForm(emptyResult); setShowResultForm(false); fetchData()
  }

  const medalClass = { Gold: 'medal-gold', Silver: 'medal-silver', Bronze: 'medal-bronze' }

  if (loading) return (
    <div className="animate-in dashboard-premium">
      <PageHeader title="Competition Analytics" subtitle="Loading..." />
      <div className="row g-3">{Array.from({ length: 4 }).map((_, i) => (
        <div className="col-sm-6 col-xl-3" key={i}><Skeleton className="skeleton-kpi" /></div>
      ))}</div>
    </div>
  )

  return (
    <div className="animate-in dashboard-premium">
      <PageHeader
        title="Competition Analytics"
        subtitle="Events · Results · Medals · Rankings · Win rate"
        action={<button type="button" className="btn-gold" onClick={() => setShowCompForm(!showCompForm)}><FaPlus /> Add Competition</button>}
      />

      {medals && (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <KpiCard icon={FaMedal} label="Gold Medals" value={medals.gold} change={10} trend="up" variant="gold" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <KpiCard icon={FaMedal} label="Silver Medals" value={medals.silver} change={5} trend="up" variant="info" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <KpiCard icon={FaMedal} label="Bronze Medals" value={medals.bronze} change={3} trend="up" variant="warning" />
          </div>
          <div className="col-sm-6 col-xl-3">
            <KpiCard icon={FaTrophy} label="Win Rate" value={`${winRate}%`} change={8} trend="up" variant="success" sparkData={[60, 65, 68, 72, winRate]} />
          </div>
        </div>
      )}

      {medalChart && (
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="chart-panel-premium glass-card" style={{ minHeight: 280 }}>
              <h6>Medal Distribution</h6>
              <div style={{ height: 200 }}>
                <Doughnut data={medalChart} options={{
                  ...baseChartOptions,
                  cutout: '65%',
                  plugins: { ...baseChartOptions.plugins, legend: { position: 'bottom', labels: { color: '#94A3B8' } } },
                }} />
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="chart-panel-premium glass-card" style={{ minHeight: 280 }}>
              <h6>Medal Trends</h6>
              <div style={{ height: 200 }}>
                <Bar data={{
                  labels: ['Gold', 'Silver', 'Bronze', 'Total'],
                  datasets: [{ data: [medals.gold, medals.silver, medals.bronze, medals.total], backgroundColor: [MEDAL_GOLD, '#C0C0C0', '#CD7F32', '#22C55E'], borderRadius: 8 }],
                }} options={{
                  ...baseChartOptions,
                  scales: {
                    x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
                    y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
                  },
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showCompForm && (
        <div className="glass-card mb-4">
          <h6 className="analytics-card-title"><FaTrophy /> New Competition</h6>
          <form onSubmit={handleCompSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label-custom">Name *</label>
                <input className="form-control-custom" value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <label className="form-label-custom">Sport *</label>
                <input className="form-control-custom" value={compForm.sport}
                  onChange={(e) => setCompForm({ ...compForm, sport: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <label className="form-label-custom">Level</label>
                <select className="form-select-custom" value={compForm.level}
                  onChange={(e) => setCompForm({ ...compForm, level: e.target.value })}>
                  <option>Local</option><option>State</option><option>National</option><option>International</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Date *</label>
                <input type="date" className="form-control-custom" value={compForm.competition_date}
                  onChange={(e) => setCompForm({ ...compForm, competition_date: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Venue</label>
                <input className="form-control-custom" value={compForm.venue}
                  onChange={(e) => setCompForm({ ...compForm, venue: e.target.value })} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn-gold">Save</button>
              <button type="button" className="btn-outline-navy" onClick={() => setShowCompForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showResultForm && selectedComp && (
        <div className="glass-card mb-4">
          <h6 className="analytics-card-title">Add Result</h6>
          <form onSubmit={handleResultSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label-custom">Athlete *</label>
                <select className="form-select-custom" value={resultForm.athlete}
                  onChange={(e) => setResultForm({ ...resultForm, athlete: e.target.value })} required>
                  <option value="">Select</option>
                  {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label-custom">Position</label>
                <input type="number" className="form-control-custom" value={resultForm.position}
                  onChange={(e) => setResultForm({ ...resultForm, position: e.target.value })} />
              </div>
              <div className="col-md-2">
                <label className="form-label-custom">Medal</label>
                <select className="form-select-custom" value={resultForm.medal}
                  onChange={(e) => setResultForm({ ...resultForm, medal: e.target.value })}>
                  <option value="None">None</option><option value="Gold">Gold</option>
                  <option value="Silver">Silver</option><option value="Bronze">Bronze</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Score</label>
                <input className="form-control-custom" value={resultForm.score}
                  onChange={(e) => setResultForm({ ...resultForm, score: e.target.value })} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn-gold">Save Result</button>
              <button type="button" className="btn-outline-navy" onClick={() => setShowResultForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {competitions.map((comp) => (
        <div className="glass-card comp-card-premium" key={comp.id}>
          <div className="comp-header">
            <div>
              <h5 className="comp-title">{comp.name}</h5>
              <p className="comp-meta">{comp.sport} · {comp.level} · {comp.competition_date} · {comp.venue || 'TBD'}</p>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn-gold btn-sm"
                onClick={() => { setSelectedComp(comp.id); setShowResultForm(true) }}>Add Result</button>
              <button type="button" className="btn-icon btn-icon-delete"
                onClick={async () => { if (confirm('Delete?')) { await competitionsAPI.delete(comp.id); showToast('Deleted'); fetchData() } }}>
                <FaTrash />
              </button>
            </div>
          </div>
          {comp.results?.length > 0 ? (
            <div className="result-pills">
              {comp.results.map((r) => (
                <div className={`result-pill ${medalClass[r.medal] || ''}`} key={r.id}>
                  <strong>{r.athlete_name}</strong>
                  <span>{r.medal !== 'None' ? r.medal : `#${r.position || '—'}`}</span>
                  {r.score && <small className="text-muted">{r.score}</small>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>No results recorded yet.</p>
          )}
        </div>
      ))}
    </div>
  )
}