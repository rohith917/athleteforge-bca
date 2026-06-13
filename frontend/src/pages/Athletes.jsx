/**
 * Athletes — premium card grid with readiness indicators
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { athletesAPI, ensureApiSession } from '../services/api'
import { parseListResponse, getLoadErrorMessage } from '../utils/apiHelpers'
import DataErrorPanel from '../components/DataErrorPanel'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FaPlus, FaSearch, FaUsers } from 'react-icons/fa'
import PageHeader from '../components/PageHeader'
import AthleteGridCard from '../components/analytics/AthleteGridCard'
import { Skeleton } from '../components/ui/Skeleton'

export default function Athletes() {
  const [athletes, setAthletes] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const { isStaff } = useAuth()
  const { showToast } = useToast()

  const fetchAthletes = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const ok = await ensureApiSession()
      if (!ok) {
        setLoadError('Session not verified — sign in again (admin / admin123).')
        setAthletes([])
        return
      }
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await athletesAPI.getAll(params)
      setAthletes(parseListResponse(res.data))
    } catch (err) {
      setLoadError(getLoadErrorMessage(err, 'athletes'))
      setAthletes([])
      showToast('Failed to load athletes', 'error')
    } finally { setLoading(false) }
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

  const counts = {
    total: athletes.length,
    active: athletes.filter((a) => a.status === 'Active').length,
    injured: athletes.filter((a) => a.status === 'Injured').length,
  }

  return (
    <div className="animate-in dashboard-luxury">
      <PageHeader
        title="Athlete Management"
        subtitle="Elite roster intelligence · Readiness · Performance profiles"
        action={isStaff ? <Link to="/dashboard/athletes/new" className="btn-gold text-decoration-none"><FaPlus /> Add Athlete</Link> : null}
      />

      <div className="filter-bar-premium">
        <div className="search-input-wrap flex-grow-1">
          <FaSearch />
          <input type="text" className="form-control-custom" placeholder="Search athletes..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select-custom" style={{ maxWidth: 180 }}
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Injured">Injured</option>
          <option value="Inactive">Inactive</option>
        </select>
        <div className="d-flex gap-3 ms-auto" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span><strong className="text-gold">{counts.total}</strong> Total</span>
          <span><strong style={{ color: '#22C55E' }}>{counts.active}</strong> Active</span>
          <span><strong style={{ color: '#EF4444' }}>{counts.injured}</strong> Injured</span>
        </div>
      </div>

      {loadError && <DataErrorPanel message={loadError} onRetry={fetchAthletes} />}

      {loading ? (
        <div className="athlete-grid">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="skeleton-kpi" />)}
        </div>
      ) : !loadError && athletes.length === 0 ? (
        <div className="glass-card empty-state"><FaUsers /><p>No athletes found</p></div>
      ) : (
        <div className="athlete-grid">
          {athletes.map((a) => (
            <AthleteGridCard key={a.id} athlete={a} isCoach={isStaff} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}