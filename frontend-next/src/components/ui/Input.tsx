import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => (
    <div>
      <label htmlFor={id} className="font-body text-xs font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={cn(
          'mt-3 w-full rounded-xl border border-border bg-surface px-4 py-3.5 font-body text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent',
          className,
        )}
        {...props}
      />
    </div>
  ),
)
Input.displayName = 'Input'
