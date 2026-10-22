import { m as motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/format'
import { EASE_OUT_SOFT } from '@/lib/motion'

interface MenuToggleIconProps {
  open: boolean
  className?: string
}

const barClass = 'absolute start-1/2 block h-0.5 w-6 -translate-x-1/2 rounded-full bg-current origin-center'

export function MenuToggleIcon({ open, className }: MenuToggleIconProps) {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE_OUT_SOFT }

  return (
    <span
      className={cn('relative inline-flex h-6 w-6 shrink-0 items-center justify-center', className)}
      aria-hidden
    >
      <motion.span
        className={barClass}
        animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -7 }}
        transition={transition}
      />
      <motion.span
        className={barClass}
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={transition}
      />
      <motion.span
        className={barClass}
        animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 7 }}
        transition={transition}
      />
    </span>
  )
}
