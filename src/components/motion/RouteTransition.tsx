import { m as motion, useReducedMotion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { pageEnter } from '@/lib/motion'

interface RouteTransitionProps {
  children?: ReactNode
}

/**
 * Enter-only page transition keyed by pathname.
 * Opacity-led (tiny y) so sticky chrome and child IntersectionObservers stay stable.
 */
export function RouteTransition({ children }: RouteTransitionProps) {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return children ? <>{children}</> : <Outlet />
  }

  return (
    <motion.div
      key={location.pathname}
      variants={pageEnter}
      initial="initial"
      animate="animate"
      style={{ willChange: 'opacity, transform' }}
    >
      {children ?? <Outlet />}
    </motion.div>
  )
}
