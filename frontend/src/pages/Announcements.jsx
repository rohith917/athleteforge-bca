/**
 * Announcements board — coach/admin broadcasts to students, coaches, or a team.
 */
import { useState, useEffect } from 'react'
import { FaBullhorn, FaPlus, FaTimes, FaThumbtack, FaTrash } from 'react-icons/fa'
import { announcementsAPI, ensureApiSession } from '../services/api'
import { parseListResponse, getLoadErrorMessage } from '../utils/apiHelpers'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import DataErrorPanel from '../components/DataErrorPanel'
import PageHeader from '../components/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'

const AUDIENCE_LABEL = { all: 'Everyone', students: 'Students', coaches: 'Coaches', team: 'Team' }
const emptyForm = { title: '', message: '', audience: 'all', team_filter: '', pinned: false }

export default function Announcements() {
  const { isStaff } = useAuth()
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const ok = await ensureApiSession()
      if (!ok) {
        setLoadError('Session not verified — sign in again.')
        return
      }
      const res = await announcementsAPI.getAll()
      setItems(parseListResponse(res.data))
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'announcements'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.message) return
    setSaving(true)
    try {
      await announcementsAPI.create(form)
      showToast('Announcement posted', 'success')
      setForm(emptyForm)
      setShowForm(false)
      fetchData()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Could not post announcement', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await announcementsAPI.delete(id)
      setItems((prev) => prev.filter((a) => a.id !== id))
    } catch {
      showToast('Could not delete announcement', 'error')
    }
  }

  return (
    <div className="animate-in dashboard-luxury">
      <PageHeader
        title="Announcements"
        subtitle="Team-wide updates from your coaches and admins"
        action={isStaff && (
          <button type="button" className="btn-gold" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <FaTimes /> : <FaPlus />} {showForm ? 'Cancel' : 'New Announcement'}
          </button>
        )}
      />

      {showForm && (
        <form className="glass-card mb-4 announcement-form" onSubmit={handleCreate}>
          <div className="row g-3">
            <div className="col-md-8">
              <input type="text" className="form-control" placeholder="Title" required
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="coaches">Coaches</option>
                <option value="team">Specific Team</option>
              </select>
            </div>
            {form.audience === 'team' && (
              <div className="col-12">
                <input type="text" className="form-control" placeholder="Team name (e.g. Team Alpha)"
                  value={form.team_filter} onChange={(e) => setForm({ ...form, team_filter: e.target.value })} />
              </div>
            )}
            <div className="col-12">
              <textarea className="form-control" rows={3} placeholder="Message" required
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="col-12 d-flex align-items-center justify-content-between">
              <label className="d-flex align-items-center gap-2 mb-0">
                <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
                <span>Pin to top</span>
              </label>
              <button type="submit" className="btn-gold" disabled={saving}>{saving ? 'Posting...' : 'Post'}</button>
            </div>
          </div>
        </form>
      )}

      <DataErrorPanel message={loadError} onRetry={fetchData} />

      {loading && (
        <div className="row g-3">
          {[1, 2, 3].map((i) => <div className="col-12" key={i}><Skeleton style={{ height: 90, borderRadius: 14 }} /></div>)}
        </div>
      )}

      {!loading && !loadError && items.length === 0 && (
        <div className="glass-card text-center py-5">
          <FaBullhorn size={32} className="mb-2 text-muted" />
          <p className="text-muted mb-0">No announcements yet.</p>
        </div>
      )}

      <div className="announcement-list">
        {items.map((a) => (
          <div className={`glass-card announcement-item ${a.pinned ? 'announcement-pinned' : ''}`} key={a.id}>
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div className="d-flex align-items-center gap-2">
                {a.pinned && <FaThumbtack className="text-warning" title="Pinned" />}
                <h6 className="mb-0">{a.title}</h6>
                <span className="badge-pill badge-active">{AUDIENCE_LABEL[a.audience] || a.audience}</span>
              </div>
              {isStaff && (
                <button type="button" className="goal-delete-btn" onClick={() => handleDelete(a.id)} aria-label="Delete announcement">
                  <FaTrash />
                </button>
              )}
            </div>
            <p className="mb-1 mt-2" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{a.message}</p>
            <small className="text-muted">{a.created_by_name} · {new Date(a.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
