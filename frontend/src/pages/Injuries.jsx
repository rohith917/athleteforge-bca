/**
 * Injury Management V2 — cards, RTP workflow, heatmap
 */
import { useState, useEffect } from 'react'
import { injuriesAPI, athletesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaBandAid } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import KpiCard from '../components/analytics/KpiCard'
import InjuryCard from '../components/analytics/InjuryCard'
import InjuryHeatmap from '../components/analytics/InjuryHeatmap'
import { Skeleton } from '../components/ui/Skeleton'

const emptyForm = {
  athlete: '', injury_type: '', body_part: '', injury_date: new Date().toISOString().split('T')[0],
  severity: 'Minor', recovery_status: 'Recovering', expected_recovery_date: '',
  medical_notes: '', treatment_plan: '',
}

const BODY_PARTS = ['Head', 'Shoulder', 'Elbow', 'Wrist', 'Back', 'Hip', 'Knee', 'Ankle', 'Foot']

export default function Injuries() {
  const [injuries, setInjuries] = useState([])
  const [athletes, setAthletes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const { isCoach } = useAuth()
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this injury record?')) return
    await injuriesAPI.delete(id)
    showToast('Deleted')
    fetchData()
  }

  const active = injuries.filter((i) => i.recovery_status !== 'Recovered').length
  const severe = injuries.filter((i) => i.severity === 'Severe').length
  const recovered = injuries.filter((i) => i.recovery_status === 'Recovered').length

  return (
    <div className="animate-in dashboard-premium">
      <PageHeader
        title="Injury Management"
        subtitle="Track injuries · Recovery timelines · Return-to-play workflow"
        action={isCoach ? <button type="button" className="btn-gold" onClick={() => setShowForm(!showForm)}><FaPlus /> Report Injury</button> : null}
      />

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaBandAid} label="Total Injuries" value={injuries.length} change={8} trend="neutral" variant="gold" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaBandAid} label="Active Cases" value={active} change={12} trend={active > 2 ? 'up' : 'down'} variant="danger" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaBandAid} label="Severe Injuries" value={severe} change={5} trend="down" variant="warning" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KpiCard icon={FaBandAid} label="Recovered" value={recovered} change={15} trend="up" variant="success" />
        </div>
      </div>

      {isCoach && showForm && (
        <div className="glass-card mb-4">
          <h6 className="analytics-card-title"><FaBandAid /> Record New Injury</h6>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label-custom">Athlete *</label>
                <select className="form-select-custom" value={form.athlete}
                  onChange={(e) => setForm({ ...form, athlete: e.target.value })} required>
                  <option value="">Select</option>
                  {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name || `${a.first_name} ${a.last_name}`}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Injury Type *</label>
                <input className="form-control-custom" value={form.injury_type}
                  onChange={(e) => setForm({ ...form, injury_type: e.target.value })} required placeholder="e.g. Sprain, Fracture" />
              </div>
              <div className="col-md-4">
                <label className="form-label-custom">Body Part *</label>
                <select className="form-select-custom" value={form.body_part}
                  onChange={(e) => setForm({ ...form, body_part: e.target.value })} required>
                  <option value="">Select</option>
                  {BODY_PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
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
              <div className="col-md-3">
                <label className="form-label-custom">Expected Return</label>
                <input type="date" className="form-control-custom" value={form.expected_recovery_date}
                  onChange={(e) => setForm({ ...form, expected_recovery_date: e.target.value })} />
              </div>
              <div className="col-md-12">
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

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="filter-bar-premium mb-3" style={{ marginBottom: 16 }}>
            <select className="form-select-custom" style={{ maxWidth: 220 }} value={filter}
              onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Recovering">Recovering</option>
              <option value="Ongoing Treatment">Ongoing Treatment</option>
              <option value="Recovered">Recovered</option>
            </select>
          </div>

          {loading ? (
            <div className="injury-grid">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="skeleton-kpi" />)}
            </div>
          ) : injuries.length === 0 ? (
            <div className="glass-card empty-state"><FaBandAid /><p>No injury records</p></div>
          ) : (
            <div className="injury-grid">
              {injuries.map((inj) => (
                <InjuryCard key={inj.id} injury={inj} isCoach={isCoach}
                  onRecoveryUpdate={handleRecoveryUpdate} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
        <div className="col-lg-4">
          <InjuryHeatmap injuries={injuries} />
        </div>
      </div>
    </div>
  )
}