import { useEffect, useState } from 'react'

export default function AnimatedCounter({ value, suffix = '', duration = 1200, decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  const target = Number(value) || 0

  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      start = target * eased
      setDisplay(start)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display)
  return <span>{formatted}{suffix}</span>
}