import { useState } from 'react'
import { calcReadiness } from '../../utils/metricsEngine'

const FIELDS = [
  { key: 'sleep', label: 'Sleep Hours', min: 0, max: 10, step: 0.5, default: 7 },
  { key: 'fatigue', label: 'Fatigue (1-5)', min: 1, max: 5, default: 2 },
  { key: 'stress', label: 'Stress (1-5)', min: 1, max: 5, default: 2 },
  { key: 'soreness', label: 'Muscle Soreness (1-5)', min: 1, max: 5, default: 2 },
  { key: 'mood', label: 'Mood (1-5)', min: 1, max: 5, default: 4 },
  { key: 'hydration', label: 'Hydration (L)', min: 0, max: 5, step: 0.5, default: 2.5 },
]

export default function WellnessCheckIn({ onUpdate }) {
  const [wellness, setWellness] = useState(
    Object.fromEntries(FIELDS.map((f) => [f.key, f.default]))
  )
  const { score, status } = calcReadiness(wellness)

  const update = (key, val) => {
    const next = { ...wellness, [key]: Number(val) }
    setWellness(next)
    onUpdate?.(next)
  }

  return (
    <div className="wellness-checkin glass-card">
      <h6 className="analytics-card-title">Daily Wellness Check-In</h6>
      <div className="wellness-score-banner">
        <span>Readiness: <strong>{score}</strong></span>
        <span className="wellness-status">{status}</span>
      </div>
      <div className="wellness-fields">
        {FIELDS.map((f) => (
          <label key={f.key} className="wellness-field">
            <span>{f.label}</span>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step || 1}
              value={wellness[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
            />
            <em>{wellness[f.key]}</em>
          </label>
        ))}
      </div>
    </div>
  )
}