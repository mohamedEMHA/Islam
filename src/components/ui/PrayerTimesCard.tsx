import { useEffect, useState } from 'react'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'
import { useDetectLocation } from '@/lib/hooks/useDetectLocation'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'
import { usePrayerTimesStore, DEFAULT_LOCATION } from '@/lib/stores/prayerTimesStore'
import { PRAYER_ORDER } from '@/types/prayer'
import { cn } from '@/lib/utils/format'
import { AsyncState } from '@/components/ui/AsyncState'
import { PrayerTimesCardSkeleton } from '@/components/ui/Skeleton'
import { getPrayerNameKey } from '@/lib/utils/prayerNames'
import { Button } from '@/components/ui/Button'

interface PrayerTimesCardProps {
  variant?: 'hero' | 'compact'
  className?: string
}

export function PrayerTimesCard({ variant = 'hero', className }: PrayerTimesCardProps) {
  const { t } = useTranslation()
  const { formatTime12, formatCountdownHms } = useLocaleFormat()
  const { data, nextPrayer, loading, error, location, hasUserLocation, refetch } = usePrayerTimes()
  const { detectAndSave, loading: detecting, error: detectError } = useDetectLocation()
  const [ariaCountdown, setAriaCountdown] = useState('')

  useEffect(() => {
    if (!nextPrayer) return
    const syncAria = () => {
      const current = usePrayerTimesStore.getState().nextPrayer
      if (current) setAriaCountdown(formatCountdownHms(current.countdownSeconds))
    }
    syncAria()
    const interval = setInterval(syncAria, 60_000)
    return () => clearInterval(interval)
  }, [nextPrayer?.name, nextPrayer?.time, formatCountdownHms])

  if (loading) {
    return (
      <PrayerTimesCardSkeleton
        className={className}
        aria-label={t('common.loading')}
      />
    )
  }

  if (error) {
    return (
      <div className={cn('bg-paper-white dark:bg-dark-surface border border-hairline dark:border-dark-border rounded-xl p-8 w-full max-w-md', className)}>
        <AsyncState
          error={error}
          errorMessage={t('errors.prayerTimes')}
          onRetry={refetch}
        />
      </div>
    )
  }

  if (!data || !nextPrayer) {
    return (
      <div className={cn('bg-paper-white dark:bg-dark-surface border border-hairline dark:border-dark-border rounded-xl p-8 w-full max-w-md', className)}>
        <AsyncState
          empty
          emptyFallback={
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <span className="material-symbols-outlined text-4xl text-stone">schedule</span>
              <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
                {t('errors.prayerTimes')}
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
                {t('common.retry')}
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  const displayPrayers = PRAYER_ORDER.filter((p) => p !== 'Sunrise')
  const current = nextPrayer.name
  const progressPct = Math.round(nextPrayer.progress * 100)
  const nextPrayerLabel = t(getPrayerNameKey(nextPrayer.name))
  const countdown = formatCountdownHms(nextPrayer.countdownSeconds)
  const hijri = data.date.hijri
  const hijriLabel = `${hijri.day} ${hijri.month.en} ${hijri.year}`

  if (variant === 'compact') {
    return (
      <LocalizedLink
        to="/prayer_times"
        className={cn(
          'inline-flex items-center gap-2 min-h-11 px-3 py-1.5 rounded-full bg-green-soft text-secondary font-label-sm text-label-sm hover:bg-cream-deep dark:bg-dark-green/20 dark:text-dark-green dark:hover:bg-dark-green/30 transition-colors',
          className,
        )}
      >
        <span className="material-symbols-outlined text-sm fill">schedule</span>
        {t('common.nextPrayer')}: {nextPrayerLabel} {formatTime12(nextPrayer.time)}
      </LocalizedLink>
    )
  }

  return (
    <div
      className={cn(
        'bg-paper-white dark:bg-dark-surface border border-hairline dark:border-dark-border rounded-xl p-6 md:p-7 w-full max-w-md shadow-sm relative overflow-hidden',
        className,
      )}
    >
      <div className="absolute top-0 end-0 p-4 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-9xl fill">mosque</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end mb-2 relative z-10">
        <div>
          <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary uppercase tracking-widest mb-1">
            {t('common.nextPrayer')}
          </p>
          <h3 className="font-heading-h3 text-heading-h3 text-primary dark:text-dark-green">{nextPrayerLabel}</h3>
        </div>
        <div className="text-end">
          <p className="font-display-h1 text-3xl sm:text-4xl md:text-[2.5rem] text-ink-black dark:text-dark-text font-light">
            {formatTime12(nextPrayer.time).split(' ')[0]}
          </p>
          <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary uppercase tracking-widest">
            {formatTime12(nextPrayer.time).split(' ')[1]}
          </p>
        </div>
      </div>

      <p
        className="font-label-sm text-label-sm text-secondary dark:text-dark-green tabular-nums mb-2 relative z-10"
        aria-hidden="true"
      >
        {t('common.remaining')}: {countdown}
      </p>
      <span className="sr-only" aria-live="polite">
        {t('common.remaining')}: {ariaCountdown || countdown}
      </span>

      <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mb-6 relative z-10">
        {hijriLabel} AH
      </p>

      <div className="w-full bg-surface-container-high dark:bg-dark-bg h-1 rounded-full mb-8 relative z-10">
        <div
          className="absolute top-0 start-0 h-full bg-secondary dark:bg-dark-green rounded-full transition-[width] duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="space-y-4 relative z-10">
        {displayPrayers.map((prayer) => {
          const isCurrent = prayer === current
          const time = data.timings[prayer]
          return (
            <div
              key={prayer}
              className={cn(
                'flex justify-between items-center py-2 border-b border-hairline dark:border-dark-border last:border-0',
                isCurrent && 'border-secondary dark:border-dark-green',
              )}
            >
              <span
                className={cn(
                  'font-body-md text-body-md flex items-center gap-2',
                  isCurrent ? 'text-secondary dark:text-dark-green font-medium' : 'text-ink-soft dark:text-dark-text-secondary',
                )}
              >
                {isCurrent && (
                  <span className="material-symbols-outlined text-sm fill">notifications_active</span>
                )}
                {t(getPrayerNameKey(prayer))}
              </span>
              <span className={cn('font-body-md text-body-md', isCurrent ? 'text-secondary dark:text-dark-green font-medium' : 'text-stone dark:text-dark-text-secondary')}>
                {formatTime12(time)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 relative z-10">
        <div className="flex justify-between items-center bg-surface dark:bg-dark-bg p-4 rounded-lg border border-hairline dark:border-dark-border">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined text-stone dark:text-dark-text-secondary shrink-0">location_on</span>
            <span className="font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary truncate">
              {hasUserLocation
                ? (location.city ?? t('common.yourLocation'))
                : t('home.defaultLocation', { city: location.city ?? DEFAULT_LOCATION.city })}
            </span>
          </div>
          <LocalizedLink to="/settings#location" className="text-secondary dark:text-dark-green font-label-sm text-label-sm hover:underline shrink-0">
            {t('common.change')}
          </LocalizedLink>
        </div>

        {!hasUserLocation && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full"
              disabled={detecting}
              onClick={() => void detectAndSave()}
            >
              <span className="material-symbols-outlined text-sm me-1">my_location</span>
              {detecting ? t('pages.welcome.gettingLocation') : t('home.useMyLocation')}
            </Button>
            {detectError && (
              <p className="font-label-sm text-label-sm text-error text-center">{detectError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
