import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number
  suffix?: string
  decimals?: number
  accent?: boolean
  className?: string
}

export function StatCard({ icon: Icon, label, value, suffix = '', decimals = 0, accent = false, className }: StatCardProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex size-11 items-center justify-center rounded-xl',
            accent ? 'bg-accent text-text' : 'bg-white/5 text-text-secondary',
          )}
        >
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-5 font-display text-3xl font-extrabold text-text">
        <AnimatedCounter to={value} suffix={suffix} decimals={decimals} duration={1.2} />
      </div>
      <div className="mt-1 font-body text-xs uppercase tracking-widest text-text-muted">{label}</div>
    </Card>
  )
}
