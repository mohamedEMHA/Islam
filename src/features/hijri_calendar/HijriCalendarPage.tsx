import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'
import { getHijriCalendar, buildHijriCalendarParams, type HijriCalendarDay } from '@/lib/api/aladhan'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { DEFAULT_LOCATION } from '@/lib/stores/prayerTimesStore'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { Skeleton } from '@/components/ui/Skeleton'
import { AttributionChip } from '@/components/content/AttributionChip'
import { AsyncState } from '@/components/ui/AsyncState'
import { cn } from '@/lib/utils/format'
import { WEEKDAY_INDEX } from '@/lib/utils/hijriCalendar'
import { HIJRI_MONTH_KEYS } from '@/lib/utils/islamicEvents'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'

const WEEKDAY_KEYS = [
  'common.weekdays.short.sun',
  'common.weekdays.short.mon',
  'common.weekdays.short.tue',
  'common.weekdays.short.wed',
  'common.weekdays.short.thu',
  'common.weekdays.short.fri',
  'common.weekdays.short.sat',
] as const

export function HijriCalendarPage() {
  const { t } = useTranslation()
  const { formatGregorianLabel: formatGregorian, formatNumericString, formatInteger } =
    useLocaleFormat()
  const settings = useSettingsStore()
  const location = settings.location ?? DEFAULT_LOCATION
  const { data } = usePrayerTimes()
  const hijriYear = Number(data?.date.hijri.year ?? 1447)
  const hijriMonth = data?.date.hijri.month.number ?? 1
  const hijriDay = Number(data?.date.hijri.day ?? 1)

  const [viewYear, setViewYear] = useState<number | null>(null)
  const [viewMonth, setViewMonth] = useState<number | null>(null)
  const [days, setDays] = useState<HijriCalendarDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasInitializedView = useRef(false)

  useEffect(() => {
    if (data?.date.hijri && !hasInitializedView.current) {
      setViewYear(hijriYear)
      setViewMonth(hijriMonth)
      hasInitializedView.current = true
    }
  }, [data?.date.hijri, hijriYear, hijriMonth])

  const loadCalendar = useCallback(() => {
    if (viewYear === null || viewMonth === null) return

    setLoading(true)
    setError(null)
    getHijriCalendar(viewYear, viewMonth, buildHijriCalendarParams(location, settings))
      .then(setDays)
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('errors.hijriCalendar'))
        setDays([])
      })
      .finally(() => setLoading(false))
  }, [
    location.latitude,
    location.longitude,
    settings,
    t,
    viewMonth,
    viewYear,
  ])

  useEffect(() => {
    loadCalendar()
  }, [loadCalendar])

  const startPad = days.length > 0 ? WEEKDAY_INDEX[days[0].weekday.en] ?? 0 : 0
  const activeYear = viewYear ?? hijriYear
  const activeMonth = viewMonth ?? hijriMonth

  const weekdayShort = (weekdayEn: string) => {
    const index = WEEKDAY_INDEX[weekdayEn]
    return index != null ? t(WEEKDAY_KEYS[index]) : weekdayEn.slice(0, 3)
  }

  const prevMonth = () => {
    if (activeMonth === 1) {
      setViewMonth(12)
      setViewYear(activeYear - 1)
    } else {
      setViewMonth(activeMonth - 1)
    }
  }

  const nextMonth = () => {
    if (activeMonth === 12) {
      setViewMonth(1)
      setViewYear(activeYear + 1)
    } else {
      setViewMonth(activeMonth + 1)
    }
  }

  const goToToday = () => {
    setViewYear(hijriYear)
    setViewMonth(hijriMonth)
  }

  const isToday = (day: string) =>
    activeYear === hijriYear && activeMonth === hijriMonth && Number(day) === hijriDay

  return (
    <PageShell title={t('pages.hijriCalendar.title')} subtitle={t('pages.hijriCalendar.subtitle')}>
      <div className="flex items-center justify-between mb-6 gap-2">
        <button type="button" onClick={prevMonth} className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full hover:bg-cream-deep text-stone" aria-label={t('pages.hijriCalendar.prevMonth')}>
          <span className="material-symbols-outlined rtl:rotate-180">chevron_left</span>
        </button>
        <div className="text-center min-w-0">
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black">
            {t(HIJRI_MONTH_KEYS[activeMonth])} {formatInteger(activeYear)} {t('pages.hijriCalendar.ah')}
          </h2>
          {(activeYear !== hijriYear || activeMonth !== hijriMonth) && (
            <button
              type="button"
              onClick={goToToday}
              className="font-label-sm text-label-sm text-secondary mt-1 hover:underline"
            >
              {t('pages.hijriCalendar.today')}
            </button>
          )}
        </div>
        <button type="button" onClick={nextMonth} className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full hover:bg-cream-deep text-stone" aria-label={t('pages.hijriCalendar.nextMonth')}>
          <span className="material-symbols-outlined rtl:rotate-180">chevron_right</span>
        </button>
      </div>

      <AsyncState
        loading={loading || viewYear === null || viewMonth === null}
        error={error}
        onRetry={loadCalendar}
        loadingFallback={<Skeleton className="h-64 w-full rounded-xl" />}
      >
        <StaggerList className="grid grid-cols-7 gap-0.5 sm:gap-2">
          {WEEKDAY_KEYS.map((key) => (
            <div
              key={key}
              className="text-center font-label-sm text-[10px] sm:text-label-sm text-stone py-1.5 sm:py-2 truncate"
            >
              {t(key)}
            </div>
          ))}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} aria-hidden="true" />
          ))}
          {days.map((day) => (
            <StaggerListItem key={day.date}>
              <HoverCard
                className={cn(
                  'aspect-square p-0.5 sm:p-2 text-center relative flex flex-col items-center justify-center gap-0.5',
                  isToday(day.day) && 'bg-secondary text-on-secondary border-secondary',
                )}
              >
                <p
                  className={cn(
                    'text-sm sm:font-heading-h3 sm:text-heading-h3 leading-none',
                    isToday(day.day) && 'text-on-secondary',
                  )}
                >
                  {formatNumericString(day.day)}
                </p>
                {day.holidays.length > 0 ? (
                  <span
                    className={cn(
                      'block size-1.5 rounded-full shrink-0',
                      isToday(day.day) ? 'bg-on-secondary/80' : 'bg-caution',
                    )}
                    aria-label={t('pages.hijriCalendar.holiday')}
                    title={day.holidays.join(', ')}
                  />
                ) : (
                  <span className="block size-1.5" aria-hidden />
                )}
                <p className="hidden sm:block font-label-sm text-label-sm opacity-80">
                  {weekdayShort(day.weekday.en)}
                </p>
                <p className="hidden sm:block font-label-sm text-label-sm opacity-60">{formatGregorian(day.gregorianDate)}</p>
              </HoverCard>
            </StaggerListItem>
          ))}
        </StaggerList>
      </AsyncState>
      <div className="mt-8">
        <AttributionChip source="AlAdhan API" url="https://aladhan.com/prayer-times-api" page="Hijri Calendar" />
      </div>
    </PageShell>
  )
}
