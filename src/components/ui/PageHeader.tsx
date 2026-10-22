import type { ReactNode } from 'react'
import { m as motion, useReducedMotion } from 'framer-motion'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { easeOutSoft } from '@/lib/motion'

interface PageHeaderProps {
  title: string
  subtitle?: string
  location?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, location, actions }: PageHeaderProps) {
  const reduceMotion = useReducedMotion()

  const content = (
    <>
      <div className="flex flex-col items-center text-center">
        <h1 className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-text mb-2">
          {title}
        </h1>
        {subtitle ? (
          <p className="font-body-lg text-body-lg text-ink-soft dark:text-dark-text-secondary mb-2 max-w-2xl">
            {subtitle}
          </p>
        ) : null}
        {location ? (
          <LocalizedLink
            to="/settings"
            className="inline-flex items-center gap-2 min-h-11 text-stone hover:text-ink-black dark:text-dark-text-secondary dark:hover:text-dark-text transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]"
          >
            <span className="material-symbols-outlined">location_on</span>
            <span className="font-label-sm text-label-sm underline decoration-hairline underline-offset-4">
              {location}
            </span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </LocalizedLink>
        ) : null}
        {actions ? (
          <div className="flex flex-wrap justify-center gap-3 mt-4 lg:hidden">{actions}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="hidden lg:flex gap-4 absolute top-0 end-0">{actions}</div>
      ) : null}
    </>
  )

  if (reduceMotion) {
    return <div className="relative mb-8 md:mb-10">{content}</div>
  }

  return (
    <motion.div
      className="relative mb-8 md:mb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={easeOutSoft}
    >
      {content}
    </motion.div>
  )
}
