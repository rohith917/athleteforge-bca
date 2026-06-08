import { useState } from 'react'

const REGIONS = [
  { id: 'head', label: 'Head', x: 50, y: 8, count: 1 },
  { id: 'shoulder', label: 'Shoulder', x: 32, y: 18, count: 3 },
  { id: 'elbow', label: 'Elbow', x: 22, y: 32, count: 2 },
  { id: 'wrist', label: 'Wrist', x: 15, y: 42, count: 1 },
  { id: 'back', label: 'Back', x: 50, y: 28, count: 4 },
  { id: 'hip', label: 'Hip', x: 50, y: 48, count: 2 },
  { id: 'knee', label: 'Knee', x: 42, y: 62, count: 5 },
  { id: 'ankle', label: 'Ankle', x: 38, y: 78, count: 3 },
  { id: 'foot', label: 'Foot', x: 40, y: 90, count: 1 },
]

export default function InjuryHeatmap() {
  const [active, setActive] = useState('knee')
  const region = REGIONS.find((r) => r.id === active)

  return (
    <div className="injury-heatmap glass-card">
      <h6 className="analytics-card-title">Injury Heatmap</h6>
      <div className="heatmap-body">
        <svg viewBox="0 0 100 100" className="body-svg">
          <ellipse cx="50" cy="12" rx="8" ry="10" className="body-part" />
          <rect x="44" y="20" width="12" height="18" rx="4" className="body-part" />
          <line x1="50" y1="38" x2="50" y2="55" className="body-spine" />
          <line x1="50" y1="42" x2="30" y2="50" className="body-limb" />
          <line x1="50" y1="42" x2="70" y2="50" className="body-limb" />
          <line x1="50" y1="55" x2="42" y2="75" className="body-limb" />
          <line x1="50" y1="55" x2="58" y2="75" className="body-limb" />
          {REGIONS.map((r) => (
            <circle
              key={r.id}
              cx={r.x}
              cy={r.y}
              r={r.count > 3 ? 5 : 4}
              className={`heatmap-dot ${active === r.id ? 'active' : ''} intensity-${Math.min(r.count, 5)}`}
              onClick={() => setActive(r.id)}
            />
          ))}
        </svg>
        <div className="heatmap-info">
          <strong>{region?.label}</strong>
          <p>{region?.count} recorded injuries</p>
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