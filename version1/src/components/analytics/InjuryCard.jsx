import { FaBandAid, FaTrash, FaCalendarAlt } from 'react-icons/fa'
import RTPWorkflow, { getRTPStep } from './RTPWorkflow'

const sevColor = { Minor: '#22C55E', Moderate: '#F59E0B', Severe: '#EF4444' }

export default function InjuryCard({ injury, isCoach, onRecoveryUpdate, onDelete }) {
  const step = getRTPStep(injury.recovery_status, injury.severity)
  const progress = Math.round(((step + 1) / 6) * 100)

  return (
    <div className="injury-card glass-card">
      <div className="injury-card-header">
        <div className="injury-icon-wrap"><FaBandAid /></div>
        <div className="flex-grow-1">
          <h5 className="injury-athlete">{injury.athlete_name}</h5>
          <span className="injury-type">{injury.injury_type} · {injury.body_part}</span>
        </div>
        <span className="badge-pill" style={{
          color: sevColor[injury.severity],
          background: `${sevColor[injury.severity]}18`,
          border: `1px solid ${sevColor[injury.severity]}40`,
        }}>{injury.severity}</span>
      </div>

      <div className="injury-meta">
        <span><FaCalendarAlt /> {injury.injury_date}</span>
        {injury.expected_recovery_date && (
          <span>Return: {injury.expected_recovery_date}</span>
        )}
      </div>

      <div className="injury-recovery-row">
        <span className="recovery-label">Recovery Progress</span>
        <strong className="text-gold">{progress}%</strong>
      </div>
      <div className="progress-luxury mb-3">
        <div className="progress-luxury-fill" style={{ width: `${progress}%` }} />
      </div>

      <RTPWorkflow recoveryStatus={injury.recovery_status} severity={injury.severity} compact />

      {injury.medical_notes && (
        <p className="injury-notes mt-3">{injury.medical_notes}</p>
      )}

      <div className="injury-card-footer">
        {isCoach ? (
          <select className="form-select-custom injury-status-select" value={injury.recovery_status}
            onChange={(e) => onRecoveryUpdate(injury.id, e.target.value)}>
            <option value="Recovering">Recovering</option>
            <option value="Ongoing Treatment">Ongoing Treatment</option>
            <option value="Recovered">Recovered</option>
          </select>
        ) : (
          <span className="badge-pill badge-inactive">{injury.recovery_status}</span>
        )}
        {isCoach && (
          <button type="button" className="btn-icon btn-icon-delete" onClick={() => onDelete(injury.id)}>
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  )
}