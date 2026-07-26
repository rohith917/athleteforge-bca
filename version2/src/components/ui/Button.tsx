import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Magnetic } from '@/components/motion/Magnetic'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-body text-sm font-semibold tracking-wide transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-text hover:bg-accent-hover',
        outline: 'border border-border-strong text-text hover:border-text hover:bg-white/5',
        ghost: 'text-text-secondary hover:text-text',
        white: 'bg-text text-background hover:bg-white/85',
      },
      size: {
        default: 'h-13 px-8 py-3.5',
        sm: 'h-10 px-5 text-xs',
        lg: 'h-16 px-10 text-base',
        icon: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  magnetic?: boolean
  cursorLabel?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, magnetic = true, cursorLabel, children, ...props }, ref) => {
    const btn = (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...(!magnetic && cursorLabel ? { 'data-cursor-hover': cursorLabel } : {})}
        {...props}
      >
        {children}
      </button>
    )

    if (!magnetic) return btn

    return (
      <Magnetic strength={0.3} cursorLabel={cursorLabel}>
        {btn}
      </Magnetic>
    )
  },
)
Button.displayName = 'Button'
