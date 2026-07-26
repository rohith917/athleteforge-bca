import { useRef, createElement, type ReactNode, type ElementType } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

interface MagneticProps {
  children: ReactNode
  className?: string
  as?: ElementType
  strength?: number
  cursorLabel?: string
  onClick?: () => void
  [key: string]: unknown
}

/**
 * Wraps its child so the child physically drifts toward the cursor
 * within a bounded radius, then eases back — the classic "magnetic
 * button" interaction from award-site studios.
 */
export function Magnetic({
  children, className, as: Tag = 'div', strength = 0.4, cursorLabel, onClick, ...rest
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null)

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    gsap.to(el, {
      x: relX * strength,
      y: relY * strength,
      duration: 0.6,
      ease: 'power3.out',
    })
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
  }

  // Rendered via createElement rather than JSX: Tag is a generic ElementType,
  // and TS's JSX checker can't resolve prop types for a dynamic tag, which
  // otherwise surfaces as spurious "children expects type 'never'" errors.
  return createElement(
    Tag,
    {
      ref,
      onMouseMove: handleMove,
      onMouseLeave: handleLeave,
      onClick,
      'data-cursor-hover': cursorLabel ?? '',
      className: cn('inline-block will-change-transform', className),
      ...rest,
    },
    children,
  )
}
