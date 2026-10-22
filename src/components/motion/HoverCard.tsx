import { m as motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/format'
import { easeOutSoft, hoverLift, pressTap } from '@/lib/motion'

interface HoverCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function HoverCard({ children, className, onClick }: HoverCardProps) {
  const reduceMotion = useReducedMotion()
  const baseClass = cn(
    'bg-paper-white border border-hairline rounded-xl transition-colors hover:border-secondary dark:bg-dark-surface dark:border-dark-border dark:hover:border-dark-green',
    className,
  )

  if (reduceMotion) {
    return (
      <div className={baseClass} onClick={onClick}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={cn(baseClass, 'group')}
      whileHover={hoverLift}
      whileTap={pressTap}
      transition={easeOutSoft}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
