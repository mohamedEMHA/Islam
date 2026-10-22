import { m as motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp, staggerContainer } from '@/lib/motion'

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

/** Soft section reveal. Uses amount threshold (not aggressive negative margins) so items never stick invisible. */
export function FadeInSection({ children, className, delay = 0 }: FadeInSectionProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
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

export function StaggerChildren({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <motion.div id={id} className={className} variants={fadeUp}>
      {children}
    </motion.div>
  )
}
