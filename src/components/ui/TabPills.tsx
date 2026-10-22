import { m as motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/format'
import { easeOutSoft } from '@/lib/motion'

interface TabPillsProps<T extends string> {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  className?: string
}

export function TabPills<T extends string>({ tabs, active, onChange, className }: TabPillsProps<T>) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative min-h-11 px-4 py-2.5 font-label-sm text-label-sm rounded-full capitalize',
              'transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]',
              'active:scale-[0.98]',
              isActive
                ? reduceMotion
                  ? 'bg-green-soft text-secondary'
                  : 'text-secondary'
                : 'text-stone hover:bg-cream-deep',
            )}
          >
            {isActive && !reduceMotion ? (
              <motion.span
                layoutId="tab-pill-indicator"
                className="absolute inset-0 rounded-full bg-green-soft"
                transition={easeOutSoft}
              />
            ) : null}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
