import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface SplitTextProps {
  children: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'
  className?: string
  splitBy?: 'chars' | 'words' | 'lines'
  delay?: number
  stagger?: number
  trigger?: 'mount' | 'scroll'
  duration?: number
}

/**
 * Splits text into chars/words/lines and reveals them with a staggered
 * rise + fade — either immediately on mount (hero headline) or when
 * scrolled into view (section titles further down the page).
 */
export function SplitText({
  children, as: Tag = 'p', className, splitBy = 'words',
  delay = 0, stagger = 0.05, trigger = 'scroll', duration = 1,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const split = new SplitType(el, { types: ['lines', splitBy === 'lines' ? 'words' : splitBy] })
    const targets = splitBy === 'chars' ? split.chars : splitBy === 'lines' ? split.lines : split.words

    if (!targets || targets.length === 0) return

    // Each line is auto-wrapped by SplitType with overflow:hidden (via the
    // "lines" type), so words/chars can slide up from below and get
    // properly masked per-line instead of clipped against the whole block.
    gsap.set(targets, { yPercent: 110, opacity: 0 })

    const anim = gsap.to(targets, {
      yPercent: 0,
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: 'power4.out',
      scrollTrigger: trigger === 'scroll' ? {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      } : undefined,
    })

    return () => {
      anim.kill()
      split.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])

  return (
    <Tag ref={ref as never} className={cn('[&_.line]:overflow-hidden [&_.line]:pb-[0.15em] [&_.line]:-mb-[0.15em]', className)}>
      {children}
    </Tag>
  )
}
