import { cn } from '@/lib/utils/format'

interface ChipProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

export function Chip({ children, active, onClick, className }: ChipProps) {
  const classes = cn(
    'inline-flex items-center gap-1.5 rounded-full text-sm font-medium',
    'transition-[color,background-color,transform] duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]',
    onClick ? 'min-h-11 px-4 py-2.5 cursor-pointer active:scale-[0.98]' : 'px-3 py-1',
    active
      ? 'bg-green-soft text-green-deep'
      : 'bg-cream-deep text-stone hover:bg-green-soft',
    className,
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    )
  }

  return <span className={classes}>{children}</span>
}
