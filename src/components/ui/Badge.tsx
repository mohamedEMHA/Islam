import { cn } from '@/lib/utils/format'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'caution' | 'neutral' | 'error'
}

const variants = {
  success: 'bg-green-soft text-green-deep',
  caution: 'bg-amber-100 text-caution',
  neutral: 'bg-cream-deep text-stone',
  error: 'bg-red-100 text-error',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide',
        variants[variant],
      )}
    >
      {children}
    </span>
  )
}
