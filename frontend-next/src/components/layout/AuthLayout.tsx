import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { CoreSphere } from '@/components/three/CoreSphere'

const STATS = [
  { value: '500+', label: 'Athletes' },
  { value: '94%', label: 'Recovery Accuracy' },
  { value: 'AI', label: 'Native Insights' },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <Link
        to="/"
        className="absolute left-6 top-6 z-20 flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:text-text lg:left-10 lg:top-10"
      >
        <ArrowLeft size={14} /> Home
      </Link>

      <div className="relative hidden flex-col justify-center overflow-hidden bg-background-secondary px-16 lg:flex">
        <div className="absolute inset-0 opacity-60">
          <CoreSphere />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background-secondary via-background-secondary/40 to-transparent" />
        <div className="relative z-10 max-w-md">
          <span className="font-display text-xl font-extrabold tracking-tight text-text">
            ATHLETE<span className="text-accent">FORGE</span>
          </span>
          <h1 className="mt-8 font-display text-4xl font-extrabold uppercase leading-tight tracking-tight text-text">
            Track. <span className="text-accent">Recover.</span> Perform.
          </h1>
          <p className="mt-6 font-body leading-relaxed text-text-secondary">
            Sign in to your coach command center or athlete performance hub — injuries,
            analytics, attendance, and AI insights in one place.
          </p>
          <div className="mt-12 flex gap-10 border-t border-border pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl font-extrabold text-text">{stat.value}</div>
                <div className="mt-1 font-body text-[11px] uppercase tracking-widest text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-24">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
