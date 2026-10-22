import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'
import { cn } from '@/lib/utils/format'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation()
  const { formatInteger } = useLocaleFormat()

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      className={cn('flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-6', className)}
      aria-label={t('common.pagination.navLabel')}
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="normal-case tracking-normal min-h-11"
        aria-label={t('common.previous')}
      >
        <span className="material-symbols-outlined text-lg rtl:rotate-180" aria-hidden>
          chevron_left
        </span>
        <span className="hidden sm:inline">{t('common.previous')}</span>
      </Button>

      <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary tabular-nums min-w-[5rem] sm:min-w-[7rem] text-center">
        {t('common.pagination.pageOf', {
          page: formatInteger(page),
          total: formatInteger(totalPages),
        })}
      </p>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="normal-case tracking-normal min-h-11"
        aria-label={t('common.next')}
      >
        <span className="hidden sm:inline">{t('common.next')}</span>
        <span className="material-symbols-outlined text-lg rtl:rotate-180" aria-hidden>
          chevron_right
        </span>
      </Button>
    </nav>
  )
}
