import { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { FaPlus, FaDumbbell } from 'react-icons/fa'
import { calcTrainingLoads } from '../../utils/metricsEngine'
import { baseChartOptions, GOLD, WARNING, DANGER } from '../../utils/chartTheme'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler)

const STORAGE_KEY = 'af_training_sessions'
const emptySession = {
  date: new Date().toISOString().split('T')[0],
  duration: 60,
  type: 'Strength',
  intensity: 'Moderate',
  rpe: 6,
}

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function TrainingLoadPanel({ athleteId = '' }) {
  const [sessions, setSessions] = useState(loadSessions)
  const [form, setForm] = useState(emptySession)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  const filtered = useMemo(
    () => (athleteId ? sessions.filter((s) => String(s.athleteId) === String(athleteId)) : sessions),
    [sessions, athleteId]
  )

  const loads = calcTrainingLoads(filtered)
  const acrColor = loads.acr > 1.5 ? DANGER : loads.acr > 1.2 ? WARNING : GOLD

  const weeklyChart = {
    labels: loads.weeklyLabels,
    datasets: [{
      data: loads.weeklyLoads,
      backgroundColor: 'rgba(212, 175, 55, 0.35)',
      borderColor: GOLD,
      borderWidth: 2,
      borderRadius: 6,
    }],
  }

  const trendChart = {
    labels: loads.trendLabels,
    datasets: [
      { label: 'Acute (7d)', data: loads.acuteTrend, borderColor: WARNING, tension: 0.4, fill: false },
      { label: 'Chronic (28d)', data: loads.chronicTrend, borderColor: GOLD, tension: 0.4, fill: false },
    ],
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const load = form.duration * form.rpe
    setSessions((prev) => [
      { ...form, id: Date.now(), athleteId: athleteId || 'team', load },
      ...prev,
    ])
    setForm(emptySession)
    setShowForm(false)
  }

  return (
    <div className="glass-card training-load-panel">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 className="analytics-card-title mb-0"><FaDumbbell className="me-2" />Training Load Monitoring</h6>
        <button type="button" className="btn-gold btn-sm" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> Log Session
        </button>
      </div>

      <div className="training-load-kpis">
        <div className="tl-kpi">
          <span className="tl-val">{loads.weeklyTotal}</span>
          <span className="tl-lbl">Weekly Load</span>
        </div>
        <div className="tl-kpi">
          <span className="tl-val">{loads.monthlyTotal}</span>
          <span className="tl-lbl">Monthly Load</span>
        </div>
        <div className="tl-kpi">
          <span className="tl-val" style={{ color: acrColor }}>{loads.acr.toFixed(2)}</span>
          <span className="tl-lbl">Acute:Chronic</span>
        </div>
        <div className="tl-kpi">
          <span className={`status-pill ${loads.acr > 1.3 ? 'risk-high' : loads.acr > 1.1 ? 'risk-medium' : 'risk-low'}`}>
            {loads.acr > 1.3 ? 'High Risk' : loads.acr > 1.1 ? 'Monitor' : 'Optimal'}
          </span>
        </div>
      </div>

      {showForm && (
        <form className="training-form mt-3" onSubmit={handleSubmit}>
          <div className="row g-2">
            <div className="col-6 col-md-3">
              <label className="form-label-custom">Date</label>
              <input type="date" className="form-control-custom" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label-custom">Duration (min)</label>
              <input type="number" min="10" max="300" className="form-control-custom" value={form.duration}
                onChange={(e) => setForm({ ...form, duration: +e.target.value })} required />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label-custom">Type</label>
              <select className="form-select-custom" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Strength</option><option>Endurance</option><option>Speed</option>
                <option>Technical</option><option>Recovery</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label-custom">Intensity</label>
              <select className="form-select-custom" value={form.intensity}
                onChange={(e) => setForm({ ...form, intensity: e.target.value })}>
                <option>Low</option><option>Moderate</option><option>High</option><option>Max</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label-custom">RPE (1-10)</label>
              <input type="range" min="1" max="10" value={form.rpe}
                onChange={(e) => setForm({ ...form, rpe: +e.target.value })} />
              <em className="text-gold">{form.rpe}</em>
            </div>
            <div className="col-6 col-md-1 d-flex align-items-end">
              <button type="submit" className="btn-gold w-100">Save</button>
            </div>
          </div>
          <small className="text-muted d-block mt-2">Load = Duration × RPE = {form.duration * form.rpe} AU</small>
        </form>
      )}

      <div className="row g-3 mt-2">
        <div className="col-md-6" style={{ height: 200 }}>
          <Bar data={weeklyChart} options={{
            ...baseChartOptions,
            plugins: { ...baseChartOptions.plugins, legend: { display: false } },
            scales: {
              x: { ticks: { color: '#94A3B8' }, grid: { display: false } },
              y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
            },
          }} />
        </div>
        <div className="col-md-6" style={{ height: 200 }}>
          <Line data={trendChart} options={{
            ...baseChartOptions,
            plugins: { ...baseChartOptions.plugins, legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 12 } } },
            scales: {
              x: { ticks: { color: '#94A3B8', maxTicksLimit: 6 }, grid: { display: false } },
              y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
            },
          }} />
        </div>
      </div>
    </div>
  )
}