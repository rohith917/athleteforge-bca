import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Cursor follower: a small dot tracks the pointer exactly, a larger ring
 * trails with elastic easing and scales up over interactive elements
 * (anything with [data-cursor-hover]).
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    setEnabled(supportsHover)
    if (!supportsHover) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' })
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })

    const onMove = (e: MouseEvent) => {
      ringX(e.clientX)
      ringY(e.clientY)
      dotX(e.clientX)
      dotY(e.clientY)
    }

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-cursor-hover]') as HTMLElement | null
      setHovering(Boolean(target))
      setLabel(target?.dataset.cursorHover || '')
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [])

  if (!enabled) return null

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 transition-[width,height,background-color,border-color] duration-300"
        style={{
          width: hovering ? (label ? 88 : 56) : 32,
          height: hovering ? (label ? 88 : 56) : 32,
          backgroundColor: hovering ? 'rgba(177,18,38,0.15)' : 'transparent',
          borderColor: hovering ? 'rgba(215,38,61,0.6)' : 'rgba(255,255,255,0.3)',
          willChange: 'transform',
        }}
      >
        {label && (
          <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-text">
            {label}
          </span>
        )}
      </div>
    </>
  )
}
