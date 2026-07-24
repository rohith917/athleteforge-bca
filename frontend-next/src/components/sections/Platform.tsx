import { useRef } from 'react'
import { Activity, HeartPulse, Trophy, Users, Brain, LineChart } from 'lucide-react'
import { useTilt3D } from '@/hooks/useTilt3D'
import { SplitText } from '@/components/motion/SplitText'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: Activity,
    title: 'Performance Tracking',
    desc: 'Speed, strength, endurance, flexibility, and agility scored and trended across every session.',
    span: 'lg:col-span-2',
  },
  {
    icon: HeartPulse,
    title: 'Recovery Monitoring',
    desc: 'Injury timelines, treatment plans, and return-to-play readiness computed from real medical data.',
    span: '',
  },
  {
    icon: Users,
    title: 'Athlete Analytics',
    desc: 'Individual profiles fused with team-wide benchmarks — every athlete measured against their own baseline.',
    span: '',
  },
  {
    icon: Trophy,
    title: 'Competition Management',
    desc: 'Events, results, and medal tracking with automatic win-rate and podium analytics.',
    span: 'lg:col-span-2',
  },
  {
    icon: Brain,
    title: 'AI Copilot',
    desc: 'Ask it anything — training load, injury risk, readiness — and get an answer grounded in your real data.',
    span: 'lg:col-span-2',
  },
  {
    icon: LineChart,
    title: 'Coach Command Center',
    desc: 'Roster, attendance, and reporting in one dashboard built for the person accountable for every result.',
    span: '',
  },
]

function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  const { ref, onPointerMove, onPointerLeave } = useTilt3D({ maxTilt: 6 })
  const Icon = feature.icon
  return (
    <div
      ref={ref as never}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        'tilt-card group relative overflow-hidden rounded-3xl border border-border bg-surface p-10 transition-colors duration-300 hover:border-border-strong',
        feature.span,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: 'radial-gradient(500px circle at var(--glare-x,50%) var(--glare-y,50%), rgba(177,18,38,0.12), transparent 60%)' }}
      />
      <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3 className="relative z-10 mt-8 font-display text-xl font-bold text-text sm:text-2xl">
        {feature.title}
      </h3>
      <p className="relative z-10 mt-3 max-w-md font-body text-sm leading-relaxed text-text-secondary">
        {feature.desc}
      </p>
    </div>
  )
}

export function Platform() {
  const headerRef = useRef<HTMLDivElement>(null)

  return (
    <section id="platform" className="relative border-t border-border bg-background px-6 py-32 lg:px-12">
      <div ref={headerRef} className="mx-auto max-w-[1600px]">
        <div className="max-w-2xl">
          <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            The Platform
          </span>
          <SplitText
            as="h2"
            splitBy="lines"
            className="mt-6 font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text sm:text-5xl"
          >
            Every discipline, one intelligence layer.
          </SplitText>
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
