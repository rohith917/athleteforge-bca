import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles, TrendingUp, ShieldAlert } from 'lucide-react'
import { SplitText } from '@/components/motion/SplitText'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

gsap.registerPlugin(ScrollTrigger)

const FACTORS = [
  { label: 'Training Load', value: 82 },
  { label: 'Sleep Quality', value: 74 },
  { label: 'Injury History', value: 96 },
  { label: 'Attendance', value: 91 },
]

export function Intelligence() {
  const sectionRef = useRef<HTMLElement>(null)
  const barsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    barsRef.current.forEach((bar, i) => {
      if (!bar) return
      gsap.fromTo(
        bar,
        { width: '0%' },
        {
          width: `${FACTORS[i].value}%`,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 60%' },
        },
      )
    })
  }, [])

  return (
    <section id="intelligence" ref={sectionRef} className="relative overflow-hidden border-t border-border bg-background-secondary px-6 py-32 lg:px-12">
      <div className="pointer-events-none absolute -right-40 top-0 size-[600px] rounded-full bg-accent/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-[1600px] items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            AI Intelligence
          </span>
          <SplitText
            as="h2"
            splitBy="lines"
            className="mt-6 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text sm:text-5xl"
          >
            Readiness, computed in real time.
          </SplitText>
          <p className="mt-8 max-w-lg font-body leading-relaxed text-text-secondary">
            Every factor that determines whether an athlete should train hard, train
            light, or rest — fused into a single readiness score your coaches can act on
            before the session starts, not after an injury.
          </p>

          <div className="mt-10 flex gap-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-accent" size={20} />
              <span className="font-body text-sm text-text-secondary">Predictive, not reactive</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-accent" size={20} />
              <span className="font-body text-sm text-text-secondary">Injury risk, days ahead</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-2xl shadow-black/40 sm:p-10">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-accent" size={16} />
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-text-secondary">
                Live Readiness
              </span>
            </div>
            <span className="flex items-center gap-1.5 font-body text-[11px] text-text-muted">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
              </span>
              Streaming
            </span>
          </div>

          <div className="flex items-baseline gap-3 py-8">
            <span className="font-display text-7xl font-extrabold text-text">
              <AnimatedCounter to={88} />
            </span>
            <span className="font-body text-sm uppercase tracking-widest text-accent">
              Competition Ready
            </span>
          </div>

          <div className="flex flex-col gap-5">
            {FACTORS.map((factor, i) => (
              <div key={factor.label}>
                <div className="mb-2 flex items-center justify-between font-body text-xs text-text-secondary">
                  <span>{factor.label}</span>
                  <span className="text-text">{factor.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    ref={(node) => { barsRef.current[i] = node }}
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
