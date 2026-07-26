import type { LucideIcon } from 'lucide-react'

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-white/5 text-text-muted">
        <Icon size={24} />
      </div>
      <p className="font-body text-sm font-semibold text-text">{title}</p>
      {description && <p className="max-w-xs font-body text-xs text-text-muted">{description}</p>}
    </div>
  )
}
