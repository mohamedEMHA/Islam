import { useEffect, useState } from 'react'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { FadeInSection } from '@/components/motion/FadeInSection'
import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'
import { hijriToGregorian } from '@/lib/api/aladhan'
import {
  ISLAMIC_EVENTS,
  pickNextEvent,
  SEASONAL_BANNER_MAX_DAYS,
  type IslamicEventDef,
} from '@/lib/utils/islamicEvents'

export function SeasonalBanner() {
  const { t } = useTranslation()
  const { data } = usePrayerTimes()
  const [next, setNext] = useState<ReturnType<typeof pickNextEvent>>(null)

  useEffect(() => {
    if (!data) return
    const hijriYear = Number(data.date.hijri.year)
    let cancelled = false

    void Promise.all(
      ISLAMIC_EVENTS.map(async (event) => {
        try {
          const gregorian = await hijriToGregorian(event.hijriDay, event.hijriMonth, hijriYear)
          return { event, gregorian }
        } catch {
          return null
        }
      }),
    ).then(async (results) => {
      if (cancelled) return
      let resolved = results.filter(Boolean) as Array<{ event: IslamicEventDef; gregorian: string }>
      let picked = pickNextEvent(resolved)
      if (!picked) {
        // Try next Hijri year
        const nextYear = await Promise.all(
          ISLAMIC_EVENTS.map(async (event) => {
            try {
              const gregorian = await hijriToGregorian(event.hijriDay, event.hijriMonth, hijriYear + 1)
              return { event, gregorian }
            } catch {
              return null
            }
          }),
        )
        if (cancelled) return
        resolved = nextYear.filter(Boolean) as Array<{ event: IslamicEventDef; gregorian: string }>
        picked = pickNextEvent(resolved)
      }
      setNext(picked)
    })

    return () => {
      cancelled = true
    }
  }, [data])

  if (!next || next.daysUntil > SEASONAL_BANNER_MAX_DAYS) {
    return null
  }

  const href = next.isRamadan ? '/ramadan' : '/events'
  const title = t(next.event.nameKey)
  const subtitle =
    next.daysUntil === 0
      ? t('home.seasonalToday', { event: title })
      : t('home.seasonalDays', { event: title, days: next.daysUntil })

  return (
    <FadeInSection>
      <section className="px-margin-mobile md:px-margin-desktop py-6 max-w-screen-2xl mx-auto">
        <LocalizedLink
          to={href}
          className="flex items-center gap-4 p-5 md:p-6 rounded-xl border border-secondary/30 dark:border-dark-green/40 bg-green-soft/40 dark:bg-dark-green/10 hover:border-secondary dark:hover:border-dark-green transition-colors"
        >
          <span className="material-symbols-outlined text-3xl text-secondary dark:text-dark-green fill">
            {next.isRamadan ? 'nightlight' : 'event'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green uppercase tracking-widest mb-1">
              {t('home.seasonalLabel')}
            </p>
            <p className="font-body-lg text-body-lg text-ink-black dark:text-dark-text font-medium truncate">
              {subtitle}
            </p>
          </div>
          <span className="material-symbols-outlined text-secondary dark:text-dark-green shrink-0">arrow_forward</span>
        </LocalizedLink>
      </section>
    </FadeInSection>
  )
}
