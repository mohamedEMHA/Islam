import { m as motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp } from '@/lib/motion'

interface AnimatedPageProps {
  children: ReactNode
  className?: string
  delay?: number
}

/** Mount-based page enter animation. Prefer over FadeInSection for full pages and detail views. */
export function AnimatedPage({ children, className, delay = 0 }: AnimatedPageProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: fadeUp.hidden,
        visible: {
          ...fadeUp.visible,
          transition: { ...(fadeUp.visible as { transition: object }).transition, delay },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
