import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SplitText } from '@/components/motion/SplitText'
import { cn } from '@/lib/utils'

const TIERS = [
  {
    name: 'Academy',
    price: 'Free',
    period: 'for BCA & academic programs',
    desc: 'Everything a single team needs to move off spreadsheets.',
    features: [
      'Up to 25 athletes',
      'Performance & injury tracking',
      'Attendance & weight monitoring',
      'PDF/Excel reports',
    ],
    highlighted: false,
  },
  {
    name: 'Team',
    price: '₹4,999',
    period: 'per month',
    desc: 'For clubs and academies running multiple squads.',
    features: [
      'Unlimited athletes',
      'AI Copilot & readiness scoring',
      'Goals, leaderboard & announcements',
      'Competition & medal analytics',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'for federations & institutions',
    desc: 'Multi-academy deployments with dedicated infrastructure.',
    features: [
      'Everything in Team',
      'Multi-academy admin console',
      'Custom AI model tuning',
      'Dedicated success manager',
      'SLA-backed uptime',
    ],
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative border-t border-border bg-background px-6 py-32 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-center">
          <span className="font-body text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Pricing
          </span>
          <SplitText
            as="h2"
            splitBy="lines"
            className="mx-auto mt-6 max-w-2xl font-display text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-text sm:text-5xl"
          >
            Built to scale with your ambition.
          </SplitText>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'flex flex-col rounded-3xl border p-10 transition-colors',
                tier.highlighted
                  ? 'border-accent bg-gradient-to-b from-accent-soft to-surface'
                  : 'border-border bg-surface',
              )}
            >
              {tier.highlighted && (
                <span className="mb-6 w-fit rounded-full bg-accent px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-text">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-2xl font-bold text-text">{tier.name}</h3>
              <p className="mt-2 font-body text-sm text-text-secondary">{tier.desc}</p>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold text-text">{tier.price}</span>
              </div>
              <span className="font-body text-xs text-text-muted">{tier.period}</span>

              <ul className="mt-8 flex flex-1 flex-col gap-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 font-body text-sm text-text-secondary">
                    <Check className="mt-0.5 shrink-0 text-accent" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/register" className="mt-10">
                <Button variant={tier.highlighted ? 'primary' : 'outline'} className="w-full" magnetic={false}>
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
