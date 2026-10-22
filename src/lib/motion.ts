import type { Variants, Transition, TargetAndTransition } from 'framer-motion'

export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const

export const easeOutSoft: Transition = {
  duration: 0.45,
  ease: EASE_OUT_SOFT,
}

export const easeOutSection: Transition = {
  duration: 0.5,
  ease: EASE_OUT_SOFT,
}

export const fadeOnly: Transition = {
  duration: 0.3,
  ease: EASE_OUT_SOFT,
}

export const spring: Transition = { type: 'spring', stiffness: 260, damping: 28 }

/** @deprecated Prefer easeOutSoft / easeOutSection */
export const easeOut: Transition = easeOutSection

export const pressTap = { scale: 0.98 } as const
export const hoverLift = { y: -4 } as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeOutSection },
}

export const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0 },
  },
}

export const STAGGER_ITEM_CAP = 10
export const STAGGER_ITEM_DELAY = 0.07

export const menuSlide: Variants = {
  hidden: { opacity: 0, y: -14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.22, ease: EASE_OUT_SOFT } },
}

/** Bottom sheet enter/exit (mobile pickers, drawers from bottom). */
export const sheetUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT_SOFT } },
  exit: { opacity: 0, y: 24, transition: { duration: 0.22, ease: EASE_OUT_SOFT } },
}

export const pageEnter: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: easeOutSoft },
}

export const layoutEnter: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: EASE_OUT_SOFT } },
}

export const sectionEnter: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: easeOutSection },
}

export const tabFade: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: fadeOnly },
  exit: { opacity: 0, y: -10, transition: fadeOnly },
}

export const countPulse: TargetAndTransition = {
  scale: [1, 1.08, 1],
  transition: { duration: 0.35, ease: EASE_OUT_SOFT },
}
