/**
 * Animated live readiness score — MDNT-style tech showcase
 */
import { useState, useEffect } from 'react'

const STATUSES = [
  { min: 85, label: 'Competition Ready', color: '#c8f542' },
  { min: 70, label: 'Train Smart', color: '#f5f0e8' },
  { min: 50, label: 'Monitor Load', color: '#ff9f43' },
  { min: 0, label: 'Recovery Focus', color: '#ff3d3d' },
]

export default function LiveReadinessOrb({ initialScore = 78 }) {
  const [score, setScore] = useState(initialScore)

  useEffect(() => {
    setScore(initialScore)
  }, [initialScore])

  useEffect(() => {
    const tick = setInterval(() => {
      setScore(prev => {
        const delta = (Math.random() - 0.48) * 4
        return Math.min(98, Math.max(62, Math.round(prev + delta)))
      })
    }, 2200)
    return () => clearInterval(tick)
  }, [])

  const status = STATUSES.find(s => score >= s.min) || STATUSES[STATUSES.length - 1]

  return (
    <div className="mdnt-readiness-orb-wrap">
      <div
        className="mdnt-readiness-orb"
        style={{ '--readiness-pct': score }}
        role="img"
        aria-label={`Live readiness score ${score} percent`}
      >
        <div className="mdnt-readiness-orb-inner">
          <span className="mdnt-readiness-score">{score}</span>
          <span className="mdnt-readiness-label">Readiness</span>
        </div>
      </div>
      <span className="mdnt-readiness-status" style={{ color: status.color }}>
        ● {status.label}
      </span>
      <p style={{ fontSize: '0.82rem', color: 'var(--mdnt-muted)', textAlign: 'center', maxWidth: '28ch', margin: 0 }}>
        Real-time AI fusion of performance trends, injury history, and attendance — updates every session.
      </p>
    </div>
  )
}