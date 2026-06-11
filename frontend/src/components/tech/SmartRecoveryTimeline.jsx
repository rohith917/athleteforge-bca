/**
 * AI-predicted smart recovery timeline
 */
import { useState, useEffect } from 'react'
import { aiAPI } from '../../services/api'

const DEFAULT_STEPS = [
  { phase: 'Acute rest', status: 'done', detail: '48hr load reduction — completed' },
  { phase: 'Mobility reset', status: 'active', detail: 'AI recommends 2 mobility sessions' },
  { phase: 'Return-to-play', status: 'future', detail: 'Projected in 5–7 days at current trajectory' },
  { phase: 'Competition ready', status: 'future', detail: 'Pending readiness score ≥ 85%' },
]

export default function SmartRecoveryTimeline({ athleteId = null }) {
  const [steps, setSteps] = useState(DEFAULT_STEPS)

  useEffect(() => {
    const params = athleteId ? { athlete_id: athleteId } : {}
    aiAPI.getInsights(params)
      .then((res) => {
        const injury = res.data?.injury_risk
        const progress = res.data?.progress_summary
        const risk = injury?.risk_level || 'low'
        const att = progress?.attendance_rate ?? 90

        if (risk === 'high') {
          setSteps([
            { phase: 'Load halt', status: 'done', detail: 'High risk flagged — reduce intensity now' },
            { phase: 'Medical review', status: 'active', detail: injury?.message || 'Monitor active injuries' },
            { phase: 'Gradual return', status: 'future', detail: 'AI projects 10–14 day cautious ramp' },
            { phase: 'Full training', status: 'future', detail: 'Target when risk drops to low' },
          ])
        } else if (risk === 'medium') {
          setSteps([
            { phase: 'Deload week', status: 'done', detail: 'Moderate risk — volume reduced 20%' },
            { phase: 'Strength maintenance', status: 'active', detail: 'Keep load sub-maximal' },
            { phase: 'Skill reintegration', status: 'future', detail: `Attendance ${att}% supports 7-day window` },
            { phase: 'Peak block', status: 'future', detail: 'Resume after readiness confirmation' },
          ])
        } else {
          setSteps([
            { phase: 'Training block', status: 'done', detail: 'Low injury risk — on track' },
            { phase: 'Performance push', status: 'active', detail: progress?.summary?.slice(0, 80) || 'Maintain current program' },
            { phase: 'Taper window', status: 'future', detail: 'AI suggests taper 3 days pre-event' },
            { phase: 'Competition day', status: 'future', detail: 'Readiness target: 85%+' },
          ])
        }
      })
      .catch(() => setSteps(DEFAULT_STEPS))
  }, [athleteId])

  return (
    <div className="recovery-timeline">
      {steps.map((s) => (
        <div key={s.phase} className={`recovery-timeline-item ${s.status === 'done' ? 'done' : s.status === 'future' ? 'future' : ''}`}>
          <div className="recovery-timeline-dot" />
          <div>
            <strong>{s.phase}</strong>
            <span>{s.detail}</span>
          </div>
        </div>
      ))}
    </div>
  )
}