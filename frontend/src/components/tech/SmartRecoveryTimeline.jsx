/**
 * AI recovery timeline from backend recovery_timeline
 */
import { useState, useEffect } from 'react'
import { aiAPI } from '../../services/api'

const FALLBACK = [
  { phase: 'Assessment', status: 'active', detail: 'Loading AI recovery model...', eta_days: 0 },
]

export default function SmartRecoveryTimeline({ athleteId = null }) {
  const [steps, setSteps] = useState(FALLBACK)

  useEffect(() => {
    const params = athleteId ? { athlete_id: athleteId } : {}
    aiAPI.getInsights(params)
      .then((res) => {
        if (res.data?.recovery_timeline?.length) {
          setSteps(res.data.recovery_timeline)
        }
      })
      .catch(() => {})
  }, [athleteId])

  return (
    <div className="recovery-timeline">
      {steps.map((s) => (
        <div
          key={s.phase}
          className={`recovery-timeline-item ${s.status === 'done' ? 'done' : s.status === 'future' ? 'future' : ''}`}
        >
          <div className="recovery-timeline-dot" />
          <div>
            <strong>{s.phase}</strong>
            <span>{s.detail}</span>
            {s.eta_days > 0 && (
              <small className="d-block mt-1" style={{ color: 'var(--mdnt-accent, #ff3d3d)' }}>
                ~{s.eta_days} days
              </small>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}