import { m as motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/format'
import { Button } from '@/components/ui/Button'
import { CardBlockSkeleton } from '@/components/ui/Skeleton'
import { fadeOnly } from '@/lib/motion'

interface AsyncStateProps {
  loading?: boolean
  error?: string | null
  empty?: boolean
  onRetry?: () => void
  loadingFallback?: ReactNode
  emptyFallback?: ReactNode
  errorMessage?: string
  className?: string
  children?: ReactNode
}

export function AsyncState({
  loading = false,
  error = null,
  empty = false,
  onRetry,
  loadingFallback,
  emptyFallback,
  errorMessage,
  className,
  children,
}: AsyncStateProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()

  if (loading) {
    return (
      <div className={className} aria-busy="true" aria-live="polite" aria-label={t('common.loading')}>
        {loadingFallback ?? (
          <div className="space-y-3 py-2">
            <CardBlockSkeleton lines={2} />
            <CardBlockSkeleton lines={3} />
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12 px-6 text-center',
          className,
        )}
        role="alert"
      >
        <span className="material-symbols-outlined text-4xl text-error mb-3">error</span>
        <p className="font-body-md text-body-md text-ink-soft mb-4">
          {errorMessage ?? error}
        </p>
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )}
      </div>
    )
  }

  if (empty) {
    return (
      <div className={className}>
        {emptyFallback ?? (
          <div className="flex flex-col items-center justify-center py-12 text-stone">
            <span className="material-symbols-outlined text-4xl mb-3">inbox</span>
            <p className="font-body-md text-body-md">{t('pages.search.noResults')}</p>
          </div>
        )}
      </div>
    )
  }

  if (reduceMotion || children == null) {
    return <>{children}</>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={fadeOnly}
    >
      {children}
    </motion.div>
  )
}
