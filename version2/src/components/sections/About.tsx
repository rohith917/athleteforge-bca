import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from '@/components/motion/SplitText'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 500, suffix: '+', label: 'Athletes tracked' },
  { value: 50, suffix: '+', label: 'Academies onboard' },
  { value: 94, suffix: '%', label: 'Injury-risk accuracy' },
  { value: 24, suffix: '/7', label: 'AI availability' },
]

export function About() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const stats = el.querySelectorAll('[data-stat]')
    gsap.fromTo(
      stats,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%' },
      },
    )
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative border-t border-border bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto grid max-w-[1600px] gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            The Philosophy
          </span>
          <SplitText
            as="h2"
            splitBy="lines"
            className="mt-6 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text sm:text-5xl"
          >
            We don't predict the future. We compute it, one training session at a time.
          </SplitText>
        </div>
        <div className="flex flex-col justify-center gap-6">
          <p className="font-body text-lg leading-relaxed text-text-secondary">
            AthleteForge was built for the moment a coach needs to know — not guess —
            whether an athlete is ready to compete. Every rep, every recovery score, every
            competition result feeds one continuous intelligence layer that gets sharper
            with use.
          </p>
          <p className="font-body leading-relaxed text-text-muted">
            No spreadsheets. No fragmented tools. One system of record for performance,
            injury, attendance, and readiness — built for teams who treat data as
            seriously as they treat training.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-24 grid max-w-[1600px] grid-cols-2 gap-8 border-t border-border pt-16 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} data-stat className="opacity-0">
            <div className="font-display text-4xl font-extrabold text-text sm:text-6xl">
              <AnimatedCounter to={stat.value} suffix={stat.suffix} />
            </div>
            <p className="mt-3 font-body text-sm uppercase tracking-widest text-text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
