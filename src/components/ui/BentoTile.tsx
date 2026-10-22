import { LocalizedLink } from '@/components/routing/LocalizedLink'
import type { ReactNode } from 'react'
import { m as motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/format'
import { easeOutSoft, hoverLift, pressTap } from '@/lib/motion'

interface BentoTileProps {
  to?: string
  title: string
  description?: string
  icon: string
  className?: string
  variant?: 'default' | 'primary' | 'large'
  children?: ReactNode
}

export function BentoTile({
  to,
  title,
  description,
  icon,
  className,
  variant = 'default',
  children,
}: BentoTileProps) {
  const reduceMotion = useReducedMotion()
  const isPrimary = variant === 'primary'
  const isLarge = variant === 'large'

  const inner = (
    <motion.div
      className={cn(
        'p-5 md:p-6 flex flex-col h-full relative overflow-hidden rounded-xl border border-hairline transition-colors group',
        isLarge && 'p-6 md:p-7',
        isPrimary ? 'bg-primary text-paper-white dark:bg-dark-green' : 'bg-paper-white hover:border-secondary dark:bg-dark-surface dark:border-dark-border dark:hover:border-dark-green',
        isLarge && 'justify-between',
        !isLarge && !isPrimary && 'row-span-1',
        className,
      )}
      whileHover={reduceMotion ? undefined : isLarge ? { y: -4 } : hoverLift}
      whileTap={reduceMotion ? undefined : pressTap}
      transition={reduceMotion ? undefined : easeOutSoft}
    >
      {isLarge && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-soft/20 to-transparent z-0" />
      )}
      {isPrimary && (
        <div className="absolute end-0 bottom-0 opacity-10 transform translate-x-1/4 rtl:-translate-x-1/4 translate-y-1/4 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]">{icon}</span>
        </div>
      )}

      {isPrimary ? (
        <>
          <div className="relative z-10 max-w-sm">
            <h3 className="font-body-lg text-body-lg font-semibold mb-2 text-paper-white md:font-heading-h3 md:text-heading-h3 md:font-medium break-words">
              {title}
            </h3>
            {description && (
              <p className="font-body-md text-body-md text-green-soft opacity-90">{description}</p>
            )}
          </div>
          {to && (
            <span className="relative z-10 self-end bg-paper-white text-primary rounded-full h-12 w-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]">
              <span className="material-symbols-outlined rtl:rotate-180">arrow_forward</span>
            </span>
          )}
        </>
      ) : (
        <div className={cn('relative z-10 flex flex-col', isLarge ? 'flex-1' : '')}>
          <div
            className={cn(
              'rounded-full flex items-center justify-center mb-4',
              isLarge ? 'h-11 w-11 bg-green-soft mb-4 md:mb-5' : 'h-9 w-9 bg-surface-container-high',
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined',
                isLarge ? 'text-secondary' : 'text-ink-soft group-hover:text-secondary transition-colors',
              )}
            >
              {icon}
            </span>
          </div>
          <h3
            className={cn(
              'break-words',
              isLarge
                ? 'font-body-lg text-body-lg font-semibold text-ink-black mb-2 md:mb-3 group-hover:text-primary transition-colors dark:text-dark-text'
                : 'font-body-md text-body-md font-semibold text-ink-black mb-1.5 dark:text-dark-text',
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary line-clamp-3 leading-snug">
              {description}
            </p>
          )}
          {children}
        </div>
      )}
    </motion.div>
  )

  if (to) return <LocalizedLink to={to} className="block h-full">{inner}</LocalizedLink>
  return inner
}
