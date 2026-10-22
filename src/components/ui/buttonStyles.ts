import { cn } from '@/lib/utils/format'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-container text-paper-white hover:bg-surface-tint transition-colors dark:bg-dark-green dark:text-dark-bg dark:hover:bg-dark-green/90',
  secondary:
    'border border-hairline text-ink-soft hover:bg-cream-deep transition-colors dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface',
  ghost:
    'text-ink-soft hover:bg-cream-deep transition-colors dark:text-dark-text-secondary dark:hover:bg-dark-surface',
  text: 'text-secondary hover:text-primary underline-offset-4 hover:underline dark:text-dark-green',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-5 py-2.5 font-label-sm text-label-sm',
  md: 'min-h-11 px-6 py-2.5 font-label-sm text-label-sm',
  lg: 'min-h-12 px-8 py-4 font-label-sm text-label-sm',
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}) {
  return cn(
    'uppercase tracking-widest rounded inline-flex items-center justify-center gap-2 disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:ring-offset-2',
    'dark:focus-visible:ring-dark-green/50 dark:focus-visible:ring-offset-dark-bg',
    'transition-[color,background-color,border-color,transform,opacity] duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]',
    'active:scale-[0.98]',
    variants[variant],
    sizes[size],
    className,
  )
}
