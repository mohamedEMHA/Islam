import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'
import { cn } from '@/lib/utils/format'
import { getPrayerNameKey } from '@/lib/utils/prayerNames'

function useNextPrayerLabel() {
  const { t } = useTranslation()
  const { formatTime12 } = useLocaleFormat()
  const { nextPrayer, loading } = usePrayerTimes()

  const prayerName = nextPrayer != null ? t(getPrayerNameKey(nextPrayer.name)) : null
  const prayerTime = nextPrayer != null ? formatTime12(nextPrayer.time) : null
  const fullLabel =
    prayerName != null && prayerTime != null
      ? `${t('common.nextPrayer')}: ${prayerName} ${prayerTime}`
      : null

  return { t, loading, nextPrayer, prayerName, prayerTime, fullLabel }
}

/** Top cream strip for phone (and marketing desktop when mega-nav owns the center). */
export function NextPrayerBar({ className }: { className?: string }) {
  const { t, loading, nextPrayer, fullLabel } = useNextPrayerLabel()

  return (
    <div
      className={cn(
        'bg-cream-deep dark:bg-dark-bg border-b border-hairline dark:border-dark-border',
        className,
      )}
    >
      <div className="flex min-h-9 h-auto items-center justify-center px-2 md:px-margin-desktop max-w-screen-2xl mx-auto py-1">
        {loading && !nextPrayer ? (
          <span
            className="inline-flex items-center gap-2 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary animate-pulse truncate max-w-full"
            aria-busy="true"
            aria-label={t('common.loading')}
          >
            <span className="material-symbols-outlined text-sm fill shrink-0">schedule</span>
            <span className="truncate">{t('common.nextPrayer')}…</span>
          </span>
        ) : fullLabel ? (
          <LocalizedLink
            to="/prayer_times"
            className="inline-flex items-center gap-2 font-label-sm text-label-sm text-secondary dark:text-dark-green hover:text-primary dark:hover:text-dark-green/80 transition-colors max-w-full min-w-0"
          >
            <span className="material-symbols-outlined text-sm fill shrink-0">schedule</span>
            <span className="truncate">{fullLabel}</span>
          </LocalizedLink>
        ) : (
          <span className="inline-flex items-center gap-2 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary truncate max-w-full">
            <span className="material-symbols-outlined text-sm fill shrink-0">schedule</span>
            <span className="truncate">{t('common.nextPrayer')}</span>
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Header-center chip for tablet / iPad: cream surface + hairline, same tokens as the site chrome.
 */
export function NextPrayerInline({ className }: { className?: string }) {
  const { t, loading, nextPrayer, prayerName, prayerTime } = useNextPrayerLabel()

  return (
    <div className={cn('min-w-0 flex-1 items-center justify-center px-3', className)}>
      {loading && !nextPrayer ? (
        <span
          className="inline-flex max-w-full items-center gap-2.5 rounded-lg border border-hairline bg-cream-deep/80 px-3.5 py-2 dark:border-dark-border dark:bg-dark-bg animate-pulse"
          aria-busy="true"
          aria-label={t('common.loading')}
        >
          <span className="material-symbols-outlined text-[18px] text-stone dark:text-dark-text-secondary fill shrink-0">
            schedule
          </span>
          <span className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary truncate">
            {t('common.nextPrayer')}…
          </span>
        </span>
      ) : prayerName && prayerTime ? (
        <LocalizedLink
          to="/prayer_times"
          className="group inline-flex max-w-full min-w-0 items-center gap-2.5 rounded-lg border border-hairline bg-cream-deep/90 px-3.5 py-2 transition-colors hover:border-secondary/30 hover:bg-green-soft dark:border-dark-border dark:bg-dark-bg dark:hover:border-dark-green/40 dark:hover:bg-dark-green/10"
          aria-label={`${t('common.nextPrayer')}: ${prayerName} ${prayerTime}`}
        >
          <span className="material-symbols-outlined text-[18px] text-secondary dark:text-dark-green fill shrink-0">
            schedule
          </span>
          <span className="min-w-0 flex items-baseline gap-2 truncate">
            <span className="shrink-0 font-label-sm text-[10px] uppercase tracking-widest text-stone dark:text-dark-text-secondary">
              {t('common.nextPrayer')}
            </span>
            <span className="text-stone/50 dark:text-dark-text-secondary/40 select-none" aria-hidden>
              ·
            </span>
            <span className="truncate font-label-sm text-label-sm font-medium text-secondary dark:text-dark-green group-hover:text-primary dark:group-hover:text-dark-green">
              {prayerName}
              <span className="text-stone dark:text-dark-text-secondary font-normal"> {prayerTime}</span>
            </span>
          </span>
        </LocalizedLink>
      ) : (
        <span className="inline-flex max-w-full items-center gap-2.5 rounded-lg border border-hairline bg-cream-deep/80 px-3.5 py-2 dark:border-dark-border dark:bg-dark-bg">
          <span className="material-symbols-outlined text-[18px] text-stone dark:text-dark-text-secondary fill shrink-0">
            schedule
          </span>
          <span className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary truncate">
            {t('common.nextPrayer')}
          </span>
        </span>
      )}
    </div>
  )
}
