import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { injuriesAPI } from '../../services/api'
import { FaBandAid, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

export default function StudentInjuryStatus() {
  const [injuries, setInjuries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    injuriesAPI.getAll()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.results || []
        setInjuries(list.filter((i) => i.recovery_status !== 'Recovered').slice(0, 3))
      })
      .catch(() => setInjuries([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="glass-card student-injury-panel">
        <h6><FaBandAid className="me-2" />Injury Status</h6>
        <p className="text-muted mb-0">Loading injury records...</p>
      </div>
    )
  }

  return (
    <div className="glass-card student-injury-panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="analytics-card-title mb-0"><FaBandAid className="me-2" />Injury Status</h6>
        <Link to="/dashboard/injuries" className="auth-link">View all</Link>
      </div>
      {injuries.length === 0 ? (
        <div className="student-injury-clear">
          <FaCheckCircle className="text-success me-2" />
          No active injuries — you are cleared for training.
        </div>
      ) : (
        <ul className="student-injury-list mb-0">
          {injuries.map((inj) => (
            <li key={inj.id} className={`student-injury-item severity-${(inj.severity || 'low').toLowerCase()}`}>
              <FaExclamationTriangle className="me-2" />
              <div>
                <strong>{inj.injury_type || 'Injury'}</strong>
                <small className="d-block">{inj.body_part} · {inj.recovery_status} · {inj.severity}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}