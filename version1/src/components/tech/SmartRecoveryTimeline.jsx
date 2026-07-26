/**
 * AI recovery timeline from backend recovery_timeline
 */
import { useState, useEffect } from 'react'
import { aiAPI } from '../../services/api'

const LOADING = [
  { phase: 'Assessment', status: 'active', detail: 'Loading AI recovery model...', eta_days: 0 },
]

const FALLBACK = [
  { phase: 'Assessment', status: 'done', detail: 'Baseline mobility and pain screening complete.', eta_days: 0 },
  { phase: 'Rehab', status: 'active', detail: 'Progressive loading with coach-approved exercises.', eta_days: 5 },
  { phase: 'Return to Train', status: 'future', detail: 'Full sessions once readiness score stays above 80%.', eta_days: 12 },
]

export default function SmartRecoveryTimeline({ athleteId = null }) {
  const [steps, setSteps] = useState(LOADING)

  useEffect(() => {
    const params = athleteId ? { athlete_id: athleteId } : {}
    aiAPI.getInsights(params)
      .then((res) => {
        if (res.data?.recovery_timeline?.length) {
          setSteps(res.data.recovery_timeline)
        } else {
          setSteps(FALLBACK)
        }
      })
      .catch(() => setSteps(FALLBACK))
  }, [athleteId])

  return (
    <div className="recovery-timeline">
      {steps.map((s, i) => (
        <div
          key={`${s.phase}-${i}`}
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