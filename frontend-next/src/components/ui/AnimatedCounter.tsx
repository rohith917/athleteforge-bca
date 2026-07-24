import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedCounterProps {
  to: number
  suffix?: string
  duration?: number
  decimals?: number
}

/** Counts up from 0 to `to` once scrolled into view, driven by GSAP so
 * the easing matches the rest of the site's motion language. */
export function AnimatedCounter({ to, suffix = '', duration = 1.6, decimals = 0 }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const counter = { value: 0 }
    const tween = gsap.to(counter, {
      value: to,
      duration,
      ease: 'power2.out',
      onUpdate: () => setDisplay(counter.value),
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    })
    return () => {
      tween.kill()
    }
  }, [to, duration])

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
