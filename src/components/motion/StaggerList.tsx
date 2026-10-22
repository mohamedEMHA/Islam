import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { m as motion, useReducedMotion } from 'framer-motion'
import { easeOutSection, STAGGER_ITEM_CAP, STAGGER_ITEM_DELAY } from '@/lib/motion'

interface StaggerListProps {
  children: ReactNode
  className?: string
}

interface StaggerListItemProps {
  children: ReactNode
  className?: string
  id?: string
  /** Injected by StaggerList */
  staggerIndex?: number
}

/**
 * Mount-based stagger for lists and grids.
 * Delay is capped so long lists (ayahs, calendars) never feel delayed.
 * Avoids whileInView: parent transform from page transitions can leave items stuck at opacity 0.
 */
export function StaggerList({ children, className }: StaggerListProps) {
  let index = 0
  return (
    <div className={className}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child
        const item = child as ReactElement<StaggerListItemProps>
        if (item.type !== StaggerListItem) return child
        return cloneElement(item, { staggerIndex: index++ })
      })}
    </div>
  )
}

export function StaggerListItem({
  children,
  className,
  id,
  staggerIndex = 0,
}: StaggerListItemProps) {
  const reduceMotion = useReducedMotion()
  const delay = Math.min(staggerIndex, STAGGER_ITEM_CAP) * STAGGER_ITEM_DELAY

  if (reduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...easeOutSection, delay }}
    >
      {children}
    </motion.div>
  )
}
