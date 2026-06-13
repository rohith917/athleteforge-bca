/**
 * Performance Analytics — radar charts, trends, training load
 */
import { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { performanceAPI, athletesAPI, ensureApiSession } from '../services/api'
import { parseListResponse, getLoadErrorMessage } from '../utils/apiHelpers'
import DataErrorPanel from '../components/DataErrorPanel'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaTrash, FaChartLine, FaBolt } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import PerformanceRadar from '../components/analytics/PerformanceRadar'
import TrainingLoadPanel from '../components/analytics/TrainingLoadPanel'
import { GOLD, baseChartOptions } from '../utils/chartTheme'
import { Skeleton } from '../components/ui/Skeleton'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend)

const emptyForm = {
  athlete: '', record_date: new Date().toISOString().split('T')[0],
  speed_score: '', strength_score: '', endurance_score: '',
  flexibility_score: '', agility_score: '', notes: '',
}

const METRICS = ['speed_score', 'strength_score', 'endurance_score', 'flexibility_score', 'agility_score']

export default function Performance() {
  const [records, setRecords] = useState([])
  const [athletes, setAthletes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [filterAthlete, setFilterAthlete] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { isStaff, isStudent, user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (isStudent && user?.athlete_id) {
      setFilterAthlete(String(user.athlete_id))
    }
  }, [isStudent, user?.athlete_id])

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const ok = await ensureApiSession()
      if (!ok) {
        setLoadError('Session not verified — sign in again.')
        return
      }
      const params = filterAthlete ? { athlete_id: filterAthlete } : {}
      const [perfRes, athRes] = await Promise.all([
        performanceAPI.getAll(params), athletesAPI.getAll(),
      ])
      const recs = parseListResponse(perfRes.data)
      setRecords(recs)
      setAthletes(parseListResponse(athRes.data))
      const dashRes = await performanceAPI.getDashboard(params)
      const d = dashRes.data
      setChartData({
        labels: d.labels,
        datasets: [
          { label: 'Speed', data: d.speed, borderColor: GOLD, tension: 0.4, fill: false },
          { label: 'Strength', data: d.strength, borderColor: '#22C55E', tension: 0.4, fill: false },
          { label: 'Endurance', data: d.endurance, borderColor: '#60A5FA', tension: 0.4, fill: false },
          { label: 'Flexibility', data: d.flexibility, borderColor: '#F59E0B', tension: 0.4, fill: false },
          { label: 'Agility', data: d.agility, borderColor: '#A855F7', tension: 0.4, fill: false },
        ],
      })
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'performance data'))
      showToast('Failed to load performance data', 'error')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filterAthlete])

  const avgScores = useMemo(() => {
    if (!records.length) return {}
    const sums = {}
    METRICS.forEach((m) => { sums[m] = 0 })
    let count = 0
    records.forEach((r) => {
      METRICS.forEach((m) => { if (r[m]) { sums[m] += parseFloat(r[m]); count++ } })
    })
    const n = records.length
    return {
      speed: Math.round((sums.speed_score / n) || 0),
      strength: Math.round((sums.strength_score / n) || 0),
      endurance: Math.round((sums.endurance_score / n) || 0),
      flexibility: Math.round((sums.flexibility_score / n) || 0),
      agility: Math.round((sums.agility_score / n) || 0),
      power: Math.round((sums.strength_score / n) || 0),
      recovery: 75,
    }
  }, [records])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await performanceAPI.create(form)
      showToast('Performance recorded successfully')
      setForm(emptyForm); setShowForm(false); fetchData()
    } catch { showToast('Failed to record performance', 'error') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    await performanceAPI.delete(id)
    showToast('Record deleted'); fetchData()
  }

  const overallAvg = Math.round(
    (avgScores.speed + avgScores.strength + avgScores.endurance + avgScores.flexibility + avgScores.agility) / 5 || 0
  )

  return (
    <div className={`animate-in dashboard-luxury ${isStudent ? 'student-panel' : 'coach-panel'}`}>
      <PageHeader
        title={isStudent ? 'My Performance' : 'Performance Analytics'}
        subtitle={isStudent ? 'Your training scores, trends, and readiness' : 'Speed · Strength · Power · Endurance · Agility · Training load'}
        action={isStaff ? <button type="button" className="btn-gold" onClick={() => setShowForm(!showForm)}><FaPlus /> Record Performance</button> : null}
      />
      {loadError && <DataErrorPanel message={loadError} onRetry={fetchData} />}

      {!isStudent && (
        <div className="filter-bar-premium mb-4">
          <select className="form-select-custom" style={{ maxWidth: 280 }} value={filterAthlete}
            onChange={(e) => setFilterAthlete(e.target.value)}>
            <option value="">All Athletes</option>
            {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
          </select>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaChartLine} label="Total Records" value={records.length} change={12} trend="up" variant="gold" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaBolt} label="Avg Performance" value={`${overallAvg}%`} change={5} trend="up" variant="success" sparkData={[65, 68, 72, 70, overallAvg]} />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaChartLine} label="Top Speed" value={Math.max(...records.map((r) => r.speed_score || 0), 0)} change={3} trend="up" variant="info" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaBolt} label="Top Strength" value={Math.max(...records.map((r) => r.strength_score || 0), 0)} change={7} trend="up" variant="warning" />
        </div>
      </div>

      {isStaff && showForm && (
        <div className="glass-card mb-4">
          <h6 className="analytics-card-title"><FaChartLine /> New Performance Record</h6>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label-custom">Athlete *</label>
                <select className="form-select-custom" value={form.athlete}
                  onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                  <option value="">Select Athlete</option>
                  {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Date *</label>
                <input type="date" className="form-control-custom" value={form.record_date}
                  onChange={(e) => setForm({ ...form, record_date: e.target.value })} required />
              </div>
              {METRICS.map((f) => (
                <div className="col-md-4" key={f}>
                  <label className="form-label-custom">{f.replace('_score', '').toUpperCase()} (0-100)</label>
                  <input type="number" step="0.1" min="0" max="100" className="form-control-custom"
                    value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn-gold">Save Record</button>
              <button type="button" className="btn-outline-navy" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="chart-panel-premium glass-card h-100">
            <h6>Performance Profile</h6>
            <PerformanceRadar scores={avgScores} />
          </div>
        </div>
        <div className="col-lg-7">
          {chartData && (
            <div className="chart-panel-premium glass-card" style={{ height: '100%', minHeight: 320 }}>
              <h6>Performance Trends</h6>
              <div style={{ height: 260 }}>
                <Line data={chartData} options={{
                  ...baseChartOptions,
                  plugins: { ...baseChartOptions.plugins, legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 12 } } },
                  scales: {
                    x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
                    y: { min: 0, max: 100, ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
                  },
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <TrainingLoadPanel athleteId={filterAthlete} />

      <div className="glass-card mt-4">
        <h6 className="analytics-card-title">Performance History</h6>
        {loading ? (
          <div className="record-grid">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="skeleton-kpi" />)}
          </div>
        ) : records.length === 0 ? (
          <p className="text-muted">No performance records yet.</p>
        ) : (
          <div className="record-grid">
            {records.map((r) => (
              <div className="record-card" key={r.id}>
                <div className="record-card-header">
                  <div>
                    <strong>{r.athlete_name}</strong>
                    <small className="d-block text-muted">{r.record_date}</small>
                  </div>
                  {isStaff && (
                    <button type="button" className="btn-icon btn-icon-delete" onClick={() => handleDelete(r.id)}><FaTrash /></button>
                  )}
                </div>
                <div className="record-scores">
                  {METRICS.map((m) => (
                    <div className="record-score" key={m}>
                      <small>{m.replace('_score', '')}</small>
                      <strong>{r[m] || '—'}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}