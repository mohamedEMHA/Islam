import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCityBySlug, SEO_CITIES } from '@shared/seo/cities'
import { getPrayerTimes } from '@/lib/api/aladhan'
import { PrayerHeroCard } from '@/components/ui/PrayerHeroCard'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'
import { getNextPrayer } from '@/lib/stores/prayerTimesStore'
import { getPrayerNameKey } from '@/lib/utils/prayerNames'
import { cn } from '@/lib/utils/format'
import { PRAYER_ORDER } from '@/types/prayer'
import type { NextPrayerInfo, PrayerTimesResponse } from '@/types/prayer'

/**
 * Embeddable prayer times widget (same look as /prayer_times).
 * Usage: <iframe src="https://islam.house/embed/prayer_times?city=london" width="360" height="640"></iframe>
 */
export function PrayerTimesEmbedPage() {
  const { t } = useTranslation()
  const { formatTime12, formatCountdown } = useLocaleFormat()
  const [params] = useSearchParams()
  const slug = params.get('city') ?? 'mecca'
  const city = getCityBySlug(slug) ?? SEO_CITIES[0]
  const [data, setData] = useState<PrayerTimesResponse | null>(null)
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError(false)
    setData(null)
    setNextPrayer(null)
    getPrayerTimes({ latitude: city.lat, longitude: city.lng })
      .then((res) => {
        if (cancelled) return
        setData(res)
        setNextPrayer(getNextPrayer(res.timings, res.meta.timezone))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [city])

  useEffect(() => {
    if (!data) return
    const tick = () => setNextPrayer(getNextPrayer(data.timings, data.meta.timezone))
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [data])

  if (error) {
    return (
      <div className="p-4 font-body-md text-body-md text-error">
        {t('errors.prayerTimes')}
      </div>
    )
  }

  if (!data || !nextPrayer) {
    return (
      <div className="p-4 font-body-md text-body-md text-ink-soft">
        {t('common.loading')}
      </div>
    )
  }

  const currentPrayer = nextPrayer.name

  return (
    <div className="p-3 sm:p-4 max-w-md mx-auto flex flex-col gap-4">
      <p className="font-label-sm text-label-sm text-ink-soft px-1">
        {city.nameEn}
      </p>

      <PrayerHeroCard
        prayerName={t(getPrayerNameKey(nextPrayer.name))}
        prayerTime={formatTime12(nextPrayer.time)}
        countdownLabel={formatCountdown(nextPrayer.countdownSeconds)}
        progress={nextPrayer.progress}
      />

      <div className="bg-paper-white rounded-xl border border-hairline p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-4 pb-3 border-b border-hairline">
          <h4 className="font-label-sm text-label-sm text-ink-soft uppercase tracking-wider">
            {t('pages.prayerTimes.schedule')}
          </h4>
          <div className="flex items-center gap-1 text-secondary bg-green-soft px-2 py-1 rounded w-fit">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span className="text-[11px] font-bold uppercase tracking-wide">
              {t('common.verifiedSource')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {PRAYER_ORDER.map((prayer, index) => {
            const isCurrent = currentPrayer === prayer
            const time = data.timings[prayer]
            return (
              <div
                key={prayer}
                className={cn(
                  'flex justify-between items-center p-3 sm:p-4 rounded-lg transition-colors',
                  isCurrent
                    ? 'bg-green-soft border border-secondary shadow-sm relative overflow-hidden'
                    : '',
                  index > 0 && !isCurrent && 'border-t border-hairline',
                )}
              >
                {isCurrent && (
                  <div className="absolute start-0 top-0 bottom-0 w-1 bg-secondary" />
                )}
                <span
                  className={cn(
                    'font-body-lg text-body-lg flex items-center gap-2',
                    isCurrent ? 'font-bold text-primary' : 'text-stone',
                  )}
                >
                  {t(getPrayerNameKey(prayer))}
                  {isCurrent && (
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      notifications_active
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'font-body-lg text-body-lg tabular-nums',
                    isCurrent ? 'font-bold text-primary' : 'text-ink-black',
                  )}
                >
                  {formatTime12(time)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-center font-label-sm text-label-sm text-ink-soft">
        <a
          href="https://islam.house"
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:underline"
        >
          islam.house
        </a>
      </p>
    </div>
  )
}
