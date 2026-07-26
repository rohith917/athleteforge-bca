/**
 * Goals & Targets — progress bars driven by real performance/weight/attendance
 * data, with inline goal creation for coaches/admins.
 */
import { useEffect, useState } from 'react'
import { FaBullseye, FaPlus, FaTimes, FaTrophy } from 'react-icons/fa'
import { goalsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const METRIC_OPTIONS = [
  { value: 'speed_score', label: 'Speed' },
  { value: 'strength_score', label: 'Strength' },
  { value: 'endurance_score', label: 'Endurance' },
  { value: 'flexibility_score', label: 'Flexibility' },
  { value: 'agility_score', label: 'Agility' },
  { value: 'weight_kg', label: 'Weight (kg)' },
  { value: 'attendance_rate', label: 'Attendance Rate (%)' },
]

const emptyForm = { metric: 'speed_score', title: '', target_value: '', target_date: '', start_value: '' }

export default function GoalTracker({ athleteId, title = 'Goals & Targets' }) {
  const { isStaff } = useAuth()
  const { showToast } = useToast()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    if (!athleteId) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await goalsAPI.getAll({ athlete_id: athleteId })
      setGoals(res.data?.results || [])
    } catch {
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [athleteId])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.target_value || !form.target_date) return
    setSaving(true)
    try {
      await goalsAPI.create({
        athlete: athleteId,
        metric: form.metric,
        title: form.title,
        target_value: form.target_value,
        target_date: form.target_date,
        start_value: form.start_value || null,
      })
      showToast('Goal created', 'success')
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Could not create goal', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await goalsAPI.delete(id)
      setGoals((prev) => prev.filter((g) => g.id !== id))
    } catch {
      showToast('Could not delete goal', 'error')
    }
  }

  if (!athleteId) return null

  return (
    <div className="glass-card goal-tracker">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="analytics-card-title mb-0"><FaBullseye className="me-2" />{title}</h6>
        {isStaff && (
          <button type="button" className="btn-outline-gold btn-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <FaTimes /> : <FaPlus />} {showForm ? 'Cancel' : 'New Goal'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="goal-form mb-3" onSubmit={handleCreate}>
          <div className="row g-2">
            <div className="col-6">
              <select className="form-select form-select-sm" value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}>
                {METRIC_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="col-6">
              <input type="text" className="form-control form-control-sm" placeholder="Goal title (optional)"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="col-6">
              <input type="number" step="0.01" className="form-control form-control-sm" placeholder="Target value" required
                value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} />
            </div>
            <div className="col-6">
              <input type="date" className="form-control form-control-sm" required
                value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-gold btn-sm mt-2" disabled={saving}>
            {saving ? 'Saving...' : 'Create Goal'}
          </button>
        </form>
      )}

      {loading && <p className="text-muted small mb-0">Loading goals...</p>}
      {!loading && goals.length === 0 && <p className="text-muted small mb-0">No goals set yet.</p>}

      <div className="goal-list">
        {goals.map((g) => {
          const p = g.progress || {}
          const pct = p.percent ?? 0
          const barClass = g.status === 'achieved' ? 'goal-bar-success' : g.status === 'missed' ? 'goal-bar-danger' : 'goal-bar-gold'
          return (
            <div className="goal-item" key={g.id}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="goal-label">
                  {g.status === 'achieved' && <FaTrophy className="text-warning me-1" />}
                  {g.title || g.metric_label}
                </span>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    {p.current_value ?? '—'} / {g.target_value} {g.status === 'active' && p.days_left >= 0 ? `· ${p.days_left}d left` : ''}
                  </small>
                  {isStaff && (
                    <button type="button" className="goal-delete-btn" onClick={() => handleDelete(g.id)} aria-label="Delete goal">
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
              <div className="goal-progress-track">
                <div className={`goal-progress-fill ${barClass}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
