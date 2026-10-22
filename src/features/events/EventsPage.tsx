import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { hijriToGregorian } from '@/lib/api/aladhan'
import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { AttributionChip } from '@/components/content/AttributionChip'
import { AsyncState } from '@/components/ui/AsyncState'
import { Skeleton } from '@/components/ui/Skeleton'
import { parseDmy } from '@/lib/utils/dateParse'
import {
  daysBetween,
  HIJRI_MONTH_KEYS,
  ISLAMIC_EVENTS,
  resolveEventDates,
} from '@/lib/utils/islamicEvents'

interface EventDateDisplay {
  gregorian: string
  hijriYear: number
  showNextYearNote: boolean
}

function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function EventsPage() {
  const { t } = useTranslation()
  const { data } = usePrayerTimes()
  const hijriYear = Number(data?.date.hijri.year ?? 1447)
  const [dates, setDates] = useState<Record<string, EventDateDisplay>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDates = useCallback(() => {
    if (!data) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const today = startOfDay(new Date())

    resolveEventDates(hijriYear)
      .then(async (resolved) => {
        const byId = new Map(resolved.map((item) => [item.event.id, item.gregorian]))
        const entries = await Promise.all(
          ISLAMIC_EVENTS.map(async (event) => {
            const gregorian = byId.get(event.id)
            if (!gregorian) {
              return [
                event.id,
                {
                  gregorian: t('pages.events.dateTbd'),
                  hijriYear,
                  showNextYearNote: false,
                },
              ] as const
            }

            let displayGregorian = gregorian
            let displayYear = hijriYear
            let showNextYearNote = false

            const parsed = parseDmy(gregorian)
            if (parsed && daysBetween(today, startOfDay(parsed)) < 0) {
              try {
                displayGregorian = await hijriToGregorian(
                  event.hijriDay,
                  event.hijriMonth,
                  hijriYear + 1,
                )
                displayYear = hijriYear + 1
                showNextYearNote = true
              } catch {
                // keep current-year date
              }
            }

            return [
              event.id,
              {
                gregorian: displayGregorian,
                hijriYear: displayYear,
                showNextYearNote,
              },
            ] as const
          }),
        )
        setDates(Object.fromEntries(entries))
      })
      .catch(() => {
        setDates({})
        setError(t('pages.events.loadError'))
      })
      .finally(() => setLoading(false))
  }, [data, hijriYear, t])

  useEffect(() => {
    loadDates()
  }, [loadDates])

  return (
    <PageShell title={t('pages.events.title')} subtitle={t('pages.events.subtitle', { year: hijriYear })}>
      <AsyncState
        loading={loading && !!data}
        error={error}
        onRetry={loadDates}
        loadingFallback={
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        }
      >
        <StaggerList className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-8 auto-rows-fr">
          {ISLAMIC_EVENTS.map((event) => {
            const display = dates[event.id]
            return (
              <StaggerListItem key={event.id} className="h-full min-h-0">
                <HoverCard className="flex h-full min-h-[6.75rem] w-full flex-col gap-2 p-4 sm:p-5 transition-colors hover:border-secondary/40 dark:border-dark-border dark:bg-dark-surface">
                  <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary tabular-nums">
                    {event.hijriDay} {t(HIJRI_MONTH_KEYS[event.hijriMonth])}
                  </p>
                  <p className="font-medium text-ink-black dark:text-dark-text line-clamp-2 leading-snug">
                    {t(event.nameKey)}
                  </p>
                  <p className="font-body-md text-body-md text-secondary dark:text-dark-green tabular-nums">
                    {display?.gregorian ?? t('pages.events.loadingDate')}
                  </p>
                  {display?.showNextYearNote ? (
                    <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                      {t('pages.events.nextYearNote', { year: display.hijriYear })}
                    </p>
                  ) : null}
                  <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                    {t('pages.events.hijriYearSuffix', { year: display?.hijriYear ?? hijriYear })}
                  </p>
                </HoverCard>
              </StaggerListItem>
            )
          })}
        </StaggerList>
      </AsyncState>
      <div className="mt-8">
        <AttributionChip source="AlAdhan API" url="https://aladhan.com/prayer-times-api" page="Islamic Events" />
      </div>
    </PageShell>
  )
}
