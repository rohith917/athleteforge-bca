/**
 * Performance tracking — record metrics with chart dashboard.
 */
import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { performanceAPI, athletesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaTrash, FaChartLine } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const emptyForm = {
  athlete: '', record_date: new Date().toISOString().split('T')[0],
  speed_score: '', strength_score: '', endurance_score: '',
  flexibility_score: '', agility_score: '', notes: '',
}

export default function Performance() {
  const [records, setRecords] = useState([])
  const [athletes, setAthletes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [filterAthlete, setFilterAthlete] = useState('')
  const [loading, setLoading] = useState(true)
  const { isCoach } = useAuth()
  const { showToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = filterAthlete ? { athlete_id: filterAthlete } : {}
      const [perfRes, athRes] = await Promise.all([
        performanceAPI.getAll(params), athletesAPI.getAll(),
      ])
      setRecords(perfRes.data.results || perfRes.data)
      setAthletes(athRes.data.results || athRes.data)
      const dashRes = await performanceAPI.getDashboard(params)
      const d = dashRes.data
      setChartData({
        labels: d.labels,
        datasets: [
          { label: 'Speed', data: d.speed, borderColor: '#FFD700', tension: 0.4, fill: false },
          { label: 'Strength', data: d.strength, borderColor: '#22c55e', tension: 0.4, fill: false },
          { label: 'Endurance', data: d.endurance, borderColor: '#3b82f6', tension: 0.4, fill: false },
          { label: 'Flexibility', data: d.flexibility, borderColor: '#f59e0b', tension: 0.4, fill: false },
          { label: 'Agility', data: d.agility, borderColor: '#a855f7', tension: 0.4, fill: false },
        ],
      })
    } catch { showToast('Failed to load performance data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filterAthlete])

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

  return (
    <div className="animate-in">
      <PageHeader
        title="Performance"
        subtitle="AthleteForge — Track speed, strength, endurance, flexibility & agility"
        action={isCoach ? <button className="btn-gold" onClick={() => setShowForm(!showForm)}><FaPlus /> Record Performance</button> : null}
      />

      {isCoach && showForm && (
        <div className="card-panel">
          <h5 className="card-panel-title"><FaChartLine /> New Performance Record</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label-custom">Athlete *</label>
                <select className="form-select-custom" value={form.athlete}
                  onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                  <option value="">Select Athlete</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Date *</label>
                <input type="date" className="form-control-custom" value={form.record_date}
                  onChange={(e) => setForm({ ...form, record_date: e.target.value })} required />
              </div>
              {['speed_score', 'strength_score', 'endurance_score', 'flexibility_score', 'agility_score'].map(f => (
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

      <select className="form-select-custom mb-4" style={{ maxWidth: 300 }} value={filterAthlete}
        onChange={(e) => setFilterAthlete(e.target.value)}>
        <option value="">All Athletes</option>
        {athletes.map(a => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
      </select>

      {chartData && (
        <div className="chart-panel mb-4">
          <h6>Performance Trends</h6>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      )}

      <div className="card-panel">
        <h5 className="card-panel-title">Performance History</h5>
        {loading ? <LoadingSpinner /> : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr><th>Athlete</th><th>Date</th><th>Speed</th><th>Strength</th><th>Endurance</th><th>Flexibility</th><th>Agility</th>{isCoach && <th></th>}</tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{r.athlete_name}</td><td>{r.record_date}</td>
                    <td>{r.speed_score || '—'}</td><td>{r.strength_score || '—'}</td>
                    <td>{r.endurance_score || '—'}</td><td>{r.flexibility_score || '—'}</td>
                    <td>{r.agility_score || '—'}</td>
                    {isCoach && <td><button className="btn-icon btn-icon-delete" onClick={() => handleDelete(r.id)}><FaTrash /></button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}