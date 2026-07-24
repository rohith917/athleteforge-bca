import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface PreloaderProps {
  onComplete: () => void
}

/**
 * Cinematic loading experience: animated 0->100 counter driven by real
 * asset/font readiness (not a fake timer), a rising accent line, then a
 * clip-path wipe reveal into the page beneath.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef({ value: 0 })

  useEffect(() => {
    let cancelled = false
    const tick = { value: 0 }

    const target = { value: 0 }
    const bump = (to: number) => {
      target.value = to
      gsap.to(tick, {
        value: target.value,
        duration: 0.6,
        ease: 'power2.out',
        onUpdate: () => {
          if (!cancelled) setProgress(Math.round(tick.value))
        },
      })
    }

    bump(30)

    Promise.all([
      document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 900)),
    ]).then(() => {
      if (cancelled) return
      bump(100)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (progress < 100) return
    const tl = gsap.timeline({
      onComplete,
      delay: 0.25,
    })
    tl.to(lineRef.current, { scaleX: 1, duration: 0.4, ease: 'power2.inOut' })
      .to(rootRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1,
        ease: 'power4.inOut',
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="flex flex-col items-center gap-6">
        <span className="font-display text-2xl font-extrabold tracking-tight text-text">
          ATHLETE<span className="text-accent">FORGE</span>
        </span>
        <div className="font-body text-6xl font-light tabular-nums text-text">
          {String(progress).padStart(2, '0')}
          <span className="text-2xl text-text-secondary">%</span>
        </div>
      </div>
      <div className="absolute bottom-16 h-px w-56 overflow-hidden bg-border">
        <div
          ref={lineRef}
          className="h-full w-full origin-left scale-x-0 bg-accent"
        />
      </div>
      <p className="absolute bottom-8 font-body text-[11px] uppercase tracking-[0.3em] text-text-muted">
        Precision. Power. Intelligence.
      </p>
    </div>
  )
}
