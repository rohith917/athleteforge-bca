/**
 * Athletes list with profile pictures — AthleteForge dark theme.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { athletesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaUsers } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import AthleteAvatar from '../components/AthleteAvatar'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Athletes() {
  const [athletes, setAthletes] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchAthletes = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await athletesAPI.getAll(params)
      setAthletes(res.data.results || res.data)
    } catch { showToast('Failed to load athletes', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAthletes() }, [search, statusFilter])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await athletesAPI.delete(id)
      showToast(`"${name}" removed`)
      fetchAthletes()
    } catch { showToast('Delete failed', 'error') }
  }

  const statusBadge = (s) => {
    const m = { Active: 'badge-active', Injured: 'badge-injured', Inactive: 'badge-inactive' }
    return <span className={`badge-pill ${m[s]}`}>{s}</span>
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Athletes"
        subtitle="Manage athlete profiles and performance records"
        action={<Link to="/athletes/new" className="btn-gold text-decoration-none"><FaPlus /> Add Athlete</Link>}
      />

      <div className="search-bar">
        <div className="search-input-wrap">
          <FaSearch />
          <input type="text" className="form-control-custom" placeholder="Search athletes..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select-custom" style={{ maxWidth: 200 }}
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Injured">Injured</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="card-panel">
        {loading ? <LoadingSpinner /> : athletes.length === 0 ? (
          <div className="empty-state"><FaUsers /><p>No athletes found</p></div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr><th>Profile</th><th>Name</th><th>Sport</th><th>Team</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {athletes.map(a => (
                  <tr key={a.id}>
                    <td><AthleteAvatar athlete={a} size={44} /></td>
                    <td>
                      <div className="athlete-row-name">
                        <div>
                          <strong>{a.full_name || `${a.first_name} ${a.last_name}`}</strong>
                          <br /><small style={{ color: 'var(--text-muted)' }}>{a.gender} · #{a.id}</small>
                        </div>
                      </div>
                    </td>
                    <td>{a.sport}</td>
                    <td>{a.team || '—'}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/athletes/${a.id}`} className="btn-icon btn-icon-view"><FaEye /></Link>
                        <Link to={`/athletes/${a.id}/edit`} className="btn-icon btn-icon-edit"><FaEdit /></Link>
                        <button className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(a.id, a.full_name || a.first_name)}><FaTrash /></button>
                      </div>
                    </td>
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