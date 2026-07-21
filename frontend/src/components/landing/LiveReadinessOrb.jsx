/**
 * Animated live readiness score — MDNT-style tech showcase.
 * Real 3D: continuously auto-rotates in a slow figure-8 (so it's visibly
 * 3D the instant the page loads, no hover required) and mouse movement
 * takes over the tilt directly, with a light-source glare that follows
 * the cursor.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

const STATUSES = [
  { min: 85, label: 'Competition Ready', color: '#c8f542' },
  { min: 70, label: 'Train Smart', color: '#f5f0e8' },
  { min: 50, label: 'Monitor Load', color: '#ff9f43' },
  { min: 0, label: 'Recovery Focus', color: '#ff3d3d' },
]

const MAX_TILT = 22
const AUTO_TILT = 10

export default function LiveReadinessOrb({ initialScore = 78 }) {
  const [score, setScore] = useState(initialScore)
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 })
  const orbRef = useRef(null)
  const hoveringRef = useRef(false)
  const rafRef = useRef(null)

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

  // Idle auto-rotation — a slow figure-8 so the 3D tilt is obvious without
  // needing to hover. Pauses the moment the pointer takes over.
  useEffect(() => {
    const start = performance.now()
    const loop = (now) => {
      if (!hoveringRef.current) {
        const t = (now - start) / 1000
        setTilt({
          x: Math.sin(t * 0.6) * AUTO_TILT,
          y: Math.sin(t * 0.4) * AUTO_TILT * 1.4,
          glareX: 50 + Math.sin(t * 0.4) * 30,
          glareY: 50 + Math.sin(t * 0.6) * 30,
        })
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handlePointerMove = useCallback((e) => {
    hoveringRef.current = true
    const el = orbRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({
      x: (0.5 - py) * MAX_TILT * 2,
      y: (px - 0.5) * MAX_TILT * 2,
      glareX: px * 100,
      glareY: py * 100,
    })
  }, [])

  const handlePointerLeave = useCallback(() => {
    hoveringRef.current = false
  }, [])

  const status = STATUSES.find(s => score >= s.min) || STATUSES[STATUSES.length - 1]

  return (
    <div className="mdnt-readiness-orb-wrap">
      <div
        ref={orbRef}
        className="mdnt-readiness-orb tilt-3d"
        style={{
          '--readiness-pct': score,
          '--glare-x': `${tilt.glareX}%`,
          '--glare-y': `${tilt.glareY}%`,
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hoveringRef.current ? 1.05 : 1})`,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        role="img"
        aria-label={`Live readiness score ${score} percent`}
      >
        <div className="mdnt-readiness-orb-glare" aria-hidden="true" />
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
