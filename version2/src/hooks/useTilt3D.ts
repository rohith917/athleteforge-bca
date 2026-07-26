import { useRef, useCallback } from 'react'

interface UseTilt3DOptions {
  maxTilt?: number
}

/**
 * Mouse-tracked 3D tilt — sets CSS custom properties consumed by the
 * `.tilt-card` utility class rather than writing inline transform/opacity
 * directly, so it never fights other styles and respects prefers-reduced-motion.
 */
export function useTilt3D({ maxTilt = 10 }: UseTilt3DOptions = {}) {
  const ref = useRef<HTMLElement>(null)

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * maxTilt * 2
    const ry = (px - 0.5) * maxTilt * 2
    el.style.setProperty('--tilt-x', `${rx}deg`)
    el.style.setProperty('--tilt-y', `${ry}deg`)
    el.style.setProperty('--glare-x', `${px * 100}%`)
    el.style.setProperty('--glare-y', `${py * 100}%`)
    el.style.setProperty('--glare-o', '1')
  }, [maxTilt])

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--glare-o', '0')
  }, [])

  return { ref, onPointerMove, onPointerLeave }
}
