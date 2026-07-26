import { useState, useMemo } from 'react'

const REGION_DEFS = [
  { id: 'head', label: 'Head', x: 50, y: 8 },
  { id: 'shoulder', label: 'Shoulder', x: 32, y: 18 },
  { id: 'elbow', label: 'Elbow', x: 22, y: 32 },
  { id: 'wrist', label: 'Wrist', x: 15, y: 42 },
  { id: 'back', label: 'Back', x: 50, y: 28 },
  { id: 'hip', label: 'Hip', x: 50, y: 48 },
  { id: 'knee', label: 'Knee', x: 42, y: 62 },
  { id: 'ankle', label: 'Ankle', x: 38, y: 78 },
  { id: 'foot', label: 'Foot', x: 40, y: 90 },
]

function matchRegion(bodyPart = '') {
  const bp = bodyPart.toLowerCase()
  return REGION_DEFS.find((r) => bp.includes(r.id) || r.label.toLowerCase() === bp)?.id || null
}

export default function InjuryHeatmap({ injuries = [] }) {
  const regions = useMemo(() => {
    const counts = Object.fromEntries(REGION_DEFS.map((r) => [r.id, 0]))
    injuries.forEach((inj) => {
      const id = matchRegion(inj.body_part)
      if (id) counts[id]++
    })
    return REGION_DEFS.map((r) => ({ ...r, count: counts[r.id] }))
  }, [injuries])

  const defaultActive = regions.reduce((best, r) => (r.count > (best?.count || 0) ? r : best), regions[0])?.id || 'knee'
  const [active, setActive] = useState(defaultActive)
  const region = regions.find((r) => r.id === active) || regions[0]

  return (
    <div className="injury-heatmap glass-card">
      <h6 className="analytics-card-title">Injury Heatmap</h6>
      <div className="heatmap-body">
        <svg viewBox="0 0 100 100" className="body-svg" role="img" aria-label="Body injury heatmap">
          <ellipse cx="50" cy="12" rx="8" ry="10" className="body-part" />
          <rect x="44" y="20" width="12" height="18" rx="4" className="body-part" />
          <line x1="50" y1="38" x2="50" y2="55" className="body-spine" />
          <line x1="50" y1="42" x2="30" y2="50" className="body-limb" />
          <line x1="50" y1="42" x2="70" y2="50" className="body-limb" />
          <line x1="50" y1="55" x2="42" y2="75" className="body-limb" />
          <line x1="50" y1="55" x2="58" y2="75" className="body-limb" />
          {regions.map((r) => (
            <circle
              key={r.id}
              cx={r.x}
              cy={r.y}
              r={r.count > 3 ? 5 : 4}
              className={`heatmap-dot ${active === r.id ? 'active' : ''} intensity-${Math.min(Math.max(r.count, 1), 5)}`}
              onClick={() => setActive(r.id)}
              style={r.count === 0 ? { opacity: 0.25 } : undefined}
            />
          ))}
        </svg>
        <div className="heatmap-info">
          <strong>{region?.label}</strong>
          <p>{region?.count || 0} recorded injuries</p>
          <span className="heatmap-legend">
            <span className="dot low" /> Low
            <span className="dot med" /> Med
            <span className="dot high" /> High
          </span>
        </div>
      </div>
    </div>
  )
}