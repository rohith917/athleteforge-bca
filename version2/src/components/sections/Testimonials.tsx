import { Quote } from 'lucide-react'
import { useTilt3D } from '@/hooks/useTilt3D'
import { SplitText } from '@/components/motion/SplitText'

const TESTIMONIALS = [
  {
    quote: 'We stopped guessing who was competition-ready. The readiness score has changed how we plan every training week.',
    name: 'Head Coach',
    org: 'Sprint Academy — Track & Field',
  },
  {
    quote: 'Injury tracking used to live in three different notebooks. Now it is one timeline, and the AI flags patterns we would have missed.',
    name: 'Team Physiotherapist',
    org: 'Elite FC — Football',
  },
  {
    quote: 'The recruiting board sees medal counts and win rates the moment a competition ends. It changed how fast we make selection calls.',
    name: 'Program Director',
    org: 'Aqua Performance — Swimming',
  },
]

function TestimonialCard({ item }: { item: (typeof TESTIMONIALS)[number] }) {
  const { ref, onPointerMove, onPointerLeave } = useTilt3D({ maxTilt: 5 })
  return (
    <div
      ref={ref as never}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="tilt-card flex h-full flex-col justify-between rounded-3xl border border-border bg-surface p-10"
    >
      <Quote className="text-accent" size={28} strokeWidth={1.5} />
      <p className="mt-8 font-display text-xl font-medium leading-snug text-text">
        "{item.quote}"
      </p>
      <div className="mt-10 border-t border-border pt-5">
        <p className="font-body text-sm font-semibold text-text">{item.name}</p>
        <p className="font-body text-xs uppercase tracking-widest text-text-muted">{item.org}</p>
      </div>
    </div>
  )
}

export function Testimonials() {
  return (
    <section id="proof" className="relative border-t border-border bg-background-secondary px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Proof
        </span>
        <SplitText
          as="h2"
          splitBy="lines"
          className="mt-6 max-w-2xl font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text sm:text-5xl"
        >
          Trusted where results are non-negotiable.
        </SplitText>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.name} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
