import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { tabFade } from '@/lib/motion'

interface TabFadeProps {
  activeKey: string
  children: ReactNode
  className?: string
}

/** Short opacity/y fade when TabPills (or similar) switch content. */
export function TabFade({ activeKey, children, className }: TabFadeProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        className={className}
        variants={tabFade}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
