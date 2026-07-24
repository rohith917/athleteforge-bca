import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <Loader2 size={size} className={cn('animate-spin text-accent', className)} />
}

export function FullScreenLoader({ message = 'Loading...', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Spinner size={32} />
      <p className="font-body text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="font-body text-xs font-semibold uppercase tracking-widest text-accent hover:text-accent-hover"
        >
          Retry
        </button>
      )}
    </div>
  )
}
