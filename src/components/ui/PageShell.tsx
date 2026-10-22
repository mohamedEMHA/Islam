import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { m as motion, useReducedMotion } from 'framer-motion'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePageMeta } from '@/lib/hooks/usePageMeta'
import { fadeOnly } from '@/lib/motion'

interface PageShellProps {
  title: string
  subtitle?: string
  location?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function PageShell({
  title,
  subtitle,
  location,
  actions,
  children,
  className,
}: PageShellProps) {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  usePageMeta({
    title,
    description: subtitle,
    path: pathname,
  })

  const body = (
    <>
      <PageHeader title={title} subtitle={subtitle} location={location} actions={actions} />
      {children}
    </>
  )

  return (
    <div className={`w-full px-margin-mobile md:px-margin-desktop py-8 md:py-10 ${className ?? ''}`}>
      {reduceMotion ? (
        body
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fadeOnly}>
          {body}
        </motion.div>
      )}
    </div>
  )
}
