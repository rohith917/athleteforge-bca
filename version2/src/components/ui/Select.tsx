import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, className, children, ...props }, ref) => (
    <div>
      {label && (
        <label htmlFor={id} className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            'mt-3 w-full appearance-none rounded-xl border border-border bg-surface px-4 py-3 font-body text-sm text-text outline-none transition-colors focus:border-accent',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  ),
)
Select.displayName = 'Select'
