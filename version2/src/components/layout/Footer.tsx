import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Magnetic } from '@/components/motion/Magnetic'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Athlete Analytics', href: '#platform' },
      { label: 'Performance Tracking', href: '#platform' },
      { label: 'Recovery Monitoring', href: '#platform' },
      { label: 'Competition Management', href: '#platform' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Intelligence', href: '#intelligence' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Access',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Request Access', href: '/register' },
      { label: 'Coach Portal', href: '/dashboard' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background-secondary px-6 pb-10 pt-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-16 border-b border-border pb-16 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-text sm:text-6xl">
              Forge your
              <br />
              edge.
            </h2>
            <p className="mt-6 max-w-sm font-body text-text-secondary">
              Join the coaches and athletes already training with AI-native intelligence.
            </p>
          </div>

          <Magnetic as={Link} to="/register" strength={0.25}>
            <span className="group flex items-center gap-4 rounded-full border border-border-strong px-8 py-5 font-body text-sm font-semibold uppercase tracking-widest text-text transition-colors hover:border-accent">
              Request Access
              <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" size={18} />
            </span>
          </Magnetic>
        </div>

        <div className="grid grid-cols-2 gap-10 py-16 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-display text-lg font-extrabold tracking-tight text-text">
              ATHLETE<span className="text-accent">FORGE</span>
            </span>
            <p className="mt-4 font-body text-sm text-text-muted">
              Precision. Power.
              <br />
              Intelligence.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                {col.title}
              </h4>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <a href={link.href} className="font-body text-sm text-text-secondary transition-colors hover:text-text">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="font-body text-sm text-text-secondary transition-colors hover:text-text">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 font-body text-xs text-text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} AthleteForge. All rights reserved.</p>
          <p>Built by Rohith Gowda V &amp; Prakruti</p>
        </div>
      </div>
    </footer>
  )
}
