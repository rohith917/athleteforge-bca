/**
 * Weight Management — trends, BMI, combat sports weight cut
 */
import { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { weightAPI, athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaCalculator, FaTrash, FaWeight } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import WeightCutTracker from '../components/analytics/WeightCutTracker'
import { GOLD, baseChartOptions } from '../utils/chartTheme'
import { Skeleton } from '../components/ui/Skeleton'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler)

const emptyForm = {
  athlete: '', record_date: new Date().toISOString().split('T')[0],
  weight_kg: '', height_cm: '', body_fat_percentage: '', muscle_mass_kg: '',
}

export default function WeightTracking() {
  const [records, setRecords] = useState([])
  const [athletes, setAthletes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [bmiResult, setBmiResult] = useState(null)
  const [bmiInput, setBmiInput] = useState({ weight_kg: '', height_cm: '' })
  const [filterAthlete, setFilterAthlete] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = filterAthlete ? { athlete_id: filterAthlete } : {}
      const [wRes, aRes] = await Promise.all([weightAPI.getAll(params), athletesAPI.getAll()])
      setRecords(wRes.data.results || wRes.data)
      setAthletes(aRes.data.results || aRes.data)
    } catch { showToast('Failed to load data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filterAthlete])

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.record_date) - new Date(a.record_date)),
    [records]
  )

  const weightChart = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(a.record_date) - new Date(b.record_date))
    return {
      labels: sorted.map((r) => r.record_date),
      datasets: [{
        data: sorted.map((r) => r.weight_kg),
        borderColor: GOLD,
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        fill: true,
        tension: 0.4,
      }],
    }
  }, [records])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await weightAPI.create(form)
      showToast('Weight record saved'); setForm(emptyForm); setShowForm(false); fetchData()
    } catch { showToast('Failed to save', 'error') }
  }

  const calculateBMI = async () => {
    try {
      const res = await weightAPI.calculateBMI(bmiInput)
      setBmiResult(res.data)
    } catch { showToast('Enter valid weight and height', 'error') }
  }

  const bmiColors = { Underweight: '#60A5FA', Normal: '#22C55E', Overweight: '#F59E0B', Obese: '#EF4444' }
  const latest = sortedRecords[0]

  return (
    <div className="animate-in dashboard-luxury">
      <PageHeader
        title="Weight Management"
        subtitle="Body composition · BMI · Weight trends · Combat sports cut"
        action={<button type="button" className="btn-gold" onClick={() => setShowForm(!showForm)}><FaPlus /> Add Record</button>}
      />

      <div className="filter-bar-premium mb-4">
        <select className="form-select-custom" style={{ maxWidth: 280 }} value={filterAthlete}
          onChange={(e) => setFilterAthlete(e.target.value)}>
          <option value="">All Athletes</option>
          {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
        </select>
        {filterAthlete && (
          <div className="d-flex align-items-center gap-2">
            <label className="form-label-custom mb-0">Target Weight (kg)</label>
            <input type="number" step="0.1" className="form-control-custom" style={{ maxWidth: 100 }}
              value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="e.g. 70" />
          </div>
        )}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaWeight} label="Latest Weight" value={latest ? `${latest.weight_kg} kg` : '—'} variant="gold" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaCalculator} label="BMI" value={latest?.bmi || '—'} variant="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaWeight} label="Body Fat" value={latest?.body_fat_percentage ? `${latest.body_fat_percentage}%` : '—'} variant="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaWeight} label="Records" value={records.length} variant="info" />
        </div>
      </div>

      {filterAthlete && sortedRecords.length > 0 && (
        <WeightCutTracker records={sortedRecords} targetWeight={targetWeight ? parseFloat(targetWeight) : null} />
      )}

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="glass-card">
            <h6 className="analytics-card-title"><FaCalculator /> BMI Calculator</h6>
            <div className="row g-3 align-items-end">
              <div className="col-6">
                <label className="form-label-custom">Weight (kg)</label>
                <input type="number" step="0.1" className="form-control-custom" value={bmiInput.weight_kg}
                  onChange={(e) => setBmiInput({ ...bmiInput, weight_kg: e.target.value })} />
              </div>
              <div className="col-6">
                <label className="form-label-custom">Height (cm)</label>
                <input type="number" step="0.1" className="form-control-custom" value={bmiInput.height_cm}
                  onChange={(e) => setBmiInput({ ...bmiInput, height_cm: e.target.value })} />
              </div>
              <div className="col-12">
                <button type="button" className="btn-gold w-100" onClick={calculateBMI}><FaCalculator /> Calculate BMI</button>
              </div>
              {bmiResult && (
                <div className="col-12">
                  <div className="p-3 text-center" style={{
                    background: `${bmiColors[bmiResult.category]}15`,
                    borderRadius: 12, border: `1.5px solid ${bmiColors[bmiResult.category]}`,
                  }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '2rem', color: bmiColors[bmiResult.category] }}>{bmiResult.bmi}</div>
                    <small>{bmiResult.category}</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          {records.length > 0 && (
            <div className="chart-panel-premium glass-card" style={{ minHeight: 280 }}>
              <h6>Weight Trend</h6>
              <div style={{ height: 220 }}>
                <Line data={weightChart} options={{
                  ...baseChartOptions,
                  scales: {
                    x: { ticks: { color: '#94A3B8', maxTicksLimit: 8 }, grid: { display: false } },
                    y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
                  },
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="glass-card mb-4">
          <h6 className="analytics-card-title"><FaWeight /> New Weight Record</h6>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label-custom">Athlete *</label>
                <select className="form-select-custom" value={form.athlete}
                  onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                  <option value="">Select</option>
                  {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label-custom">Date *</label>
                <input type="date" className="form-control-custom" value={form.record_date}
                  onChange={(e) => setForm({ ...form, record_date: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <label className="form-label-custom">Weight (kg) *</label>
                <input type="number" step="0.1" className="form-control-custom" value={form.weight_kg}
                  onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <label className="form-label-custom">Height (cm) *</label>
                <input type="number" step="0.1" className="form-control-custom" value={form.height_cm}
                  onChange={(e) => setForm({ ...form, height_cm: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <label className="form-label-custom">Body Fat %</label>
                <input type="number" step="0.1" className="form-control-custom" value={form.body_fat_percentage}
                  onChange={(e) => setForm({ ...form, body_fat_percentage: e.target.value })} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn-gold">Save</button>
              <button type="button" className="btn-outline-navy" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h6 className="analytics-card-title">Weight History</h6>
        {loading ? (
          <div className="weight-record-grid">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="skeleton-kpi" />)}
          </div>
        ) : records.length === 0 ? (
          <p className="text-muted">No weight records yet.</p>
        ) : (
          <div className="weight-record-grid">
            {sortedRecords.map((r) => (
              <div className="weight-record-card" key={r.id}>
                <div className="wr-val">{r.weight_kg} kg</div>
                <div className="wr-date">{r.record_date}</div>
                <small className="d-block text-muted">{r.athlete_name}</small>
                {r.bmi && <span className="badge-pill badge-active mt-2">{r.bmi} · {r.bmi_category}</span>}
                <button type="button" className="btn-icon btn-icon-delete mt-2"
                  onClick={async () => { if (confirm('Delete?')) { await weightAPI.delete(r.id); showToast('Deleted'); fetchData() } }}>
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}