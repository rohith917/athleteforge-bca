import { Link } from 'react-router-dom'
import { FaEye, FaEdit, FaTrash, FaHeartbeat } from 'react-icons/fa'
import AthleteAvatar from '../AthleteAvatar'

const statusClass = { Active: 'badge-active', Injured: 'badge-injured', Inactive: 'badge-inactive' }

export default function AthleteGridCard({ athlete, isCoach, onDelete }) {
  const name = athlete.full_name || `${athlete.first_name} ${athlete.last_name}`
  const readiness = athlete.status === 'Active' ? 85 : athlete.status === 'Injured' ? 42 : 60

  return (
    <div className="athlete-grid-card glass-card">
      <div className="agc-header">
        <AthleteAvatar athlete={athlete} size={56} />
        <div className="agc-info">
          <Link to={`/dashboard/athletes/${athlete.id}`} className="agc-name">{name}</Link>
          <span className="agc-meta">{athlete.sport} · {athlete.team || 'Independent'}</span>
        </div>
        <span className={`badge-pill ${statusClass[athlete.status] || 'badge-inactive'}`}>{athlete.status}</span>
      </div>

      <div className="agc-metrics">
        <div className="agc-metric">
          <FaHeartbeat />
          <div>
            <small>Readiness</small>
            <strong style={{ color: readiness >= 70 ? '#22C55E' : readiness >= 50 ? '#F59E0B' : '#EF4444' }}>
              {readiness}%
            </strong>
          </div>
        </div>
        <div className="agc-metric">
          <small>ID</small>
          <strong>#{athlete.id}</strong>
        </div>
        <div className="agc-metric">
          <small>Gender</small>
          <strong>{athlete.gender || '—'}</strong>
        </div>
      </div>

      <div className="progress-luxury agc-progress">
        <div className="progress-luxury-fill" style={{ width: `${readiness}%` }} />
      </div>

      <div className="agc-actions">
        <Link to={`/dashboard/athletes/${athlete.id}`} className="btn-icon btn-icon-view" title="View"><FaEye /></Link>
        {isCoach && (
          <>
            <Link to={`/dashboard/athletes/${athlete.id}/edit`} className="btn-icon btn-icon-edit" title="Edit"><FaEdit /></Link>
            <button type="button" className="btn-icon btn-icon-delete" title="Delete"
              onClick={() => onDelete(athlete.id, name)}><FaTrash /></button>
          </>
        )}
      </div>
    </div>
  )
}