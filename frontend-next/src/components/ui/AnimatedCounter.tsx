import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface AnimatedCounterProps {
  to: number
  suffix?: string
  duration?: number
  decimals?: number
}

/**
 * Counts up from 0 to `to` the first time it scrolls into view, driven
 * by GSAP so the easing matches the rest of the site's motion language.
 * Visibility detection uses IntersectionObserver rather than GSAP
 * ScrollTrigger: several AnimatedCounters mounting into view at once
 * (e.g. a StatCard grid) were found to sometimes never fire
 * ScrollTrigger's onEnter for some siblings — a real, reproducible bug
 * caught while verifying the Athlete Monitoring dashboard, where two of
 * four stat cards silently stayed at 0 after data loaded.
 * IntersectionObserver doesn't share that failure mode.
 *
 * Once revealed, later changes to `to` (e.g. a dashboard stat refetching
 * after a mutation) tween from the current displayed value with no
 * further visibility dependency.
 */
export function AnimatedCounter({ to, suffix = '', duration = 1.6, decimals = 0 }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const displayRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el || revealed) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!revealed) return
    const counter = { value: displayRef.current }
    const tween = gsap.to(counter, {
      value: to,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        displayRef.current = counter.value
        setDisplay(counter.value)
      },
    })
    return () => {
      tween.kill()
    }
  }, [to, duration, revealed])

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
