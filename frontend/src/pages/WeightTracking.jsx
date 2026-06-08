/**
 * Weight monitoring — BMI calculator and body fat tracking.
 */
import { useState, useEffect } from 'react'
import { weightAPI, athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaCalculator, FaTrash, FaWeight } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'

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

  const bmiColors = { Underweight: '#3498db', Normal: '#27ae60', Overweight: '#f39c12', Obese: '#e74c3c' }

  return (
    <div className="animate-in">
      <PageHeader
        title="Weight Monitoring"
        subtitle="Track weight, BMI, and body fat percentage"
        action={<button className="btn-gold" onClick={() => setShowForm(!showForm)}><FaPlus /> Add Record</button>}
      />

      <div className="card-panel">
        <h5 className="card-panel-title"><FaCalculator /> BMI Calculator</h5>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label-custom">Weight (kg)</label>
            <input type="number" step="0.1" className="form-control-custom" value={bmiInput.weight_kg}
              onChange={(e) => setBmiInput({ ...bmiInput, weight_kg: e.target.value })} />
          </div>
          <div className="col-md-3">
            <label className="form-label-custom">Height (cm)</label>
            <input type="number" step="0.1" className="form-control-custom" value={bmiInput.height_cm}
              onChange={(e) => setBmiInput({ ...bmiInput, height_cm: e.target.value })} />
          </div>
          <div className="col-md-3">
            <button className="btn-navy" onClick={calculateBMI}><FaCalculator /> Calculate</button>
          </div>
          {bmiResult && (
            <div className="col-md-3">
              <div className="p-3 text-center" style={{
                background: `${bmiColors[bmiResult.category]}15`,
                borderRadius: 8, border: `1.5px solid ${bmiColors[bmiResult.category]}`,
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: bmiColors[bmiResult.category] }}>{bmiResult.bmi}</div>
                <small>{bmiResult.category}</small>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="card-panel">
          <h5 className="card-panel-title"><FaWeight /> New Weight Record</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label-custom">Athlete *</label>
                <select className="form-select-custom" value={form.athlete}
                  onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                  <option value="">Select</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
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

      <select className="form-select-custom mb-4" style={{ maxWidth: 300 }} value={filterAthlete}
        onChange={(e) => setFilterAthlete(e.target.value)}>
        <option value="">All Athletes</option>
        {athletes.map(a => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
      </select>

      <div className="card-panel">
        <h5 className="card-panel-title">Weight History</h5>
        {loading ? <LoadingSpinner /> : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr><th>Athlete</th><th>Date</th><th>Weight</th><th>Height</th><th>BMI</th><th>Category</th><th>Body Fat</th><th></th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{r.athlete_name}</td><td>{r.record_date}</td>
                    <td>{r.weight_kg} kg</td><td>{r.height_cm} cm</td>
                    <td><strong>{r.bmi || '—'}</strong></td>
                    <td>{r.bmi_category && <span className="badge-pill badge-active">{r.bmi_category}</span>}</td>
                    <td>{r.body_fat_percentage ? `${r.body_fat_percentage}%` : '—'}</td>
                    <td><button className="btn-icon btn-icon-delete"
                      onClick={async () => { if (confirm('Delete?')) { await weightAPI.delete(r.id); showToast('Deleted'); fetchData() } }}>
                      <FaTrash /></button></td>
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