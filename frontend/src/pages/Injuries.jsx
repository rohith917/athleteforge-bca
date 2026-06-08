/**
 * Injury tracking — add injuries, update recovery, medical notes.
 */
import { useState, useEffect } from 'react'
import { injuriesAPI, athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaTrash, FaBandAid } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import LoadingSpinner from '../components/LoadingSpinner'

const emptyForm = {
  athlete: '', injury_type: '', body_part: '', injury_date: new Date().toISOString().split('T')[0],
  severity: 'Minor', recovery_status: 'Recovering', expected_recovery_date: '',
  medical_notes: '', treatment_plan: '',
}

export default function Injuries() {
  const [injuries, setInjuries] = useState([])
  const [athletes, setAthletes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = filter ? { recovery_status: filter } : {}
      const [injRes, athRes] = await Promise.all([injuriesAPI.getAll(params), athletesAPI.getAll()])
      setInjuries(injRes.data.results || injRes.data)
      setAthletes(athRes.data.results || athRes.data)
    } catch { showToast('Failed to load injuries', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await injuriesAPI.create(form)
      showToast('Injury recorded successfully')
      setForm(emptyForm); setShowForm(false); fetchData()
    } catch { showToast('Failed to add injury', 'error') }
  }

  const handleRecoveryUpdate = async (id, status) => {
    try {
      await injuriesAPI.updateRecovery(id, status)
      showToast('Recovery status updated')
      fetchData()
    } catch { showToast('Update failed', 'error') }
  }

  const sevColor = { Minor: '#27ae60', Moderate: '#f39c12', Severe: '#e74c3c' }

  return (
    <div className="animate-in">
      <PageHeader
        title="Injuries"
        subtitle="AthleteForge — Monitor recovery, medical notes & injury history"
        action={<button className="btn-gold" onClick={() => setShowForm(!showForm)}><FaPlus /> Add Injury</button>}
      />

      {showForm && (
        <div className="card-panel">
          <h5 className="card-panel-title"><FaBandAid /> Record New Injury</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label-custom">Athlete *</label>
                <select className="form-select-custom" value={form.athlete}
                  onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                  <option value="">Select</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Injury Type *</label>
                <input className="form-control-custom" value={form.injury_type}
                  onChange={(e) => setForm({ ...form, injury_type: e.target.value })} required />
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Body Part *</label>
                <input className="form-control-custom" value={form.body_part}
                  onChange={(e) => setForm({ ...form, body_part: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <label className="form-label-custom">Date *</label>
                <input type="date" className="form-control-custom" value={form.injury_date}
                  onChange={(e) => setForm({ ...form, injury_date: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <label className="form-label-custom">Severity</label>
                <select className="form-select-custom" value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  <option>Minor</option><option>Moderate</option><option>Severe</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Medical Notes</label>
                <textarea className="form-control-custom" rows="2" value={form.medical_notes}
                  onChange={(e) => setForm({ ...form, medical_notes: e.target.value })} />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn-gold">Save Injury</button>
              <button type="button" className="btn-outline-navy" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <select className="form-select-custom mb-4" style={{ maxWidth: 250 }} value={filter}
        onChange={(e) => setFilter(e.target.value)}>
        <option value="">All Status</option>
        <option value="Recovering">Recovering</option>
        <option value="Ongoing Treatment">Ongoing Treatment</option>
        <option value="Recovered">Recovered</option>
      </select>

      <div className="card-panel">
        <h5 className="card-panel-title">Injury History</h5>
        {loading ? <LoadingSpinner /> : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr><th>Athlete</th><th>Type</th><th>Body Part</th><th>Date</th><th>Severity</th><th>Status</th><th>Notes</th><th></th></tr>
              </thead>
              <tbody>
                {injuries.map(inj => (
                  <tr key={inj.id}>
                    <td>{inj.athlete_name}</td>
                    <td>{inj.injury_type}</td>
                    <td>{inj.body_part}</td>
                    <td>{inj.injury_date}</td>
                    <td><span className="badge-pill" style={{ color: sevColor[inj.severity], background: `${sevColor[inj.severity]}18` }}>{inj.severity}</span></td>
                    <td>
                      <select className="form-select-custom" style={{ maxWidth: 160, padding: '4px 8px', fontSize: '0.8rem' }}
                        value={inj.recovery_status} onChange={(e) => handleRecoveryUpdate(inj.id, e.target.value)}>
                        <option value="Recovering">Recovering</option>
                        <option value="Ongoing Treatment">Ongoing Treatment</option>
                        <option value="Recovered">Recovered</option>
                      </select>
                    </td>
                    <td><small>{inj.medical_notes?.substring(0, 40) || '—'}</small></td>
                    <td><button className="btn-icon btn-icon-delete"
                      onClick={async () => { if (confirm('Delete?')) { await injuriesAPI.delete(inj.id); showToast('Deleted'); fetchData() } }}>
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