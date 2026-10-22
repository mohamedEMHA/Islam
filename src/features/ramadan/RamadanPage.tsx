import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { m as motion, useReducedMotion } from 'framer-motion'
import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'
import {
  buildHijriCalendarParams,
  getHijriCalendar,
  type HijriCalendarDay,
} from '@/lib/api/aladhan'
import { getDuasByCategory } from '@/lib/api/duas'
import type { Dua } from '@/lib/api/duas'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { ArabicText } from '@/components/content/ArabicText'
import { AsyncState } from '@/components/ui/AsyncState'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/format'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'
import {
  computeCountdownFromTarget,
  resolveRamadanTarget,
  type RamadanTarget,
} from '@/lib/utils/ramadan'
import {
  WEEKDAY_INDEX,
  resolveRamadanHijriYear,
} from '@/lib/utils/hijriCalendar'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { DEFAULT_LOCATION } from '@/lib/stores/prayerTimesStore'
import { AttributionChip } from '@/components/content/AttributionChip'
import { countPulse } from '@/lib/motion'

interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  inRamadan: boolean
  ramadanHijriYear: number
}

const WEEKDAY_KEYS = [
  'common.weekdays.short.sun',
  'common.weekdays.short.mon',
  'common.weekdays.short.tue',
  'common.weekdays.short.wed',
  'common.weekdays.short.thu',
  'common.weekdays.short.fri',
  'common.weekdays.short.sat',
] as const

export function RamadanPage() {
  const { t } = useTranslation()
  const { formatTime12, formatGregorianLabel } = useLocaleFormat()
  const { data, loading: prayerLoading, error: prayerError, refetch } = usePrayerTimes()
  const settings = useSettingsStore()
  const location = settings.location ?? DEFAULT_LOCATION
  const reduceMotion = useReducedMotion()

  const [calendarDays, setCalendarDays] = useState<HijriCalendarDay[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [calendarError, setCalendarError] = useState<string | null>(null)
  const [ramadanDuas, setRamadanDuas] = useState<Dua[]>([])
  const [countdown, setCountdown] = useState<CountdownState | null>(null)
  const [ramadanTarget, setRamadanTarget] = useState<RamadanTarget | null>(null)

  const hijri = data?.date.hijri
  const hijriDay = Number(hijri?.day ?? 1)
  const hijriMonth = hijri?.month.number ?? 1
  const hijriYear = Number(hijri?.year ?? 1447)
  const ramadanHijriYear = resolveRamadanHijriYear(hijriMonth, hijriYear)

  const loadCalendar = useCallback(() => {
    if (!data?.date.hijri) return

    setCalendarLoading(true)
    setCalendarError(null)

    getHijriCalendar(ramadanHijriYear, 9, buildHijriCalendarParams(location, settings))
      .then(setCalendarDays)
      .catch((err) => {
        setCalendarError(err instanceof Error ? err.message : t('errors.ramadanCalendar'))
        setCalendarDays([])
      })
      .finally(() => setCalendarLoading(false))
  }, [data?.date.hijri, location, ramadanHijriYear, settings, t])

  useEffect(() => {
    loadCalendar()
  }, [loadCalendar])

  useEffect(() => {
    if (!data?.date.hijri) return
    let active = true

    resolveRamadanTarget(hijriMonth, hijriYear)
      .then((target) => {
        if (active) {
          setRamadanTarget(target)
          setCountdown(computeCountdownFromTarget(target))
        }
      })
      .catch(() => {
        if (active) setCountdown(null)
      })

    return () => {
      active = false
    }
  }, [data?.date.hijri, hijriMonth, hijriYear])

  useEffect(() => {
    if (!ramadanTarget || ramadanTarget.inRamadan) return

    const tick = () => {
      setCountdown(computeCountdownFromTarget(ramadanTarget))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [ramadanTarget])

  useEffect(() => {
    getDuasByCategory('ramadan').then(setRamadanDuas)
  }, [])

  const todayRamadanDay = hijriMonth === 9 ? hijriDay : null
  const showFastingTimes = hijriMonth === 9 || (hijriMonth === 8 && hijriDay >= 22)
  const calendarStartPad =
    calendarDays.length > 0 ? WEEKDAY_INDEX[calendarDays[0].weekday.en] ?? 0 : 0

  return (
    <PageShell title={t('pages.ramadan.title')} subtitle={t('pages.ramadan.subtitle')}>
      <AsyncState
        loading={prayerLoading && !data}
        error={prayerError}
        onRetry={refetch}
        loadingFallback={
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        }
      >
        {countdown && (
          <HoverCard className="p-6 md:p-8 mb-8 text-center dark:bg-dark-surface dark:border-dark-border">
            {countdown.inRamadan ? (
              <>
                <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-2 dark:text-dark-green">
                  {t('pages.ramadan.mubarak')}
                </p>
                <p className="font-display-h1-mobile text-display-h1-mobile text-primary dark:text-dark-green">
                  {t('pages.ramadan.dayOf', { day: hijriDay, total: calendarDays.length || 30 })}
                </p>
                <p className="font-body-md text-body-md text-stone mt-2 dark:text-dark-text-secondary">
                  {hijriYear} AH · {t('pages.ramadan.kareem')}
                </p>
              </>
            ) : (
              <>
                <p className="font-label-sm text-label-sm uppercase tracking-widest text-stone mb-4 dark:text-dark-text-secondary">
                  {t('pages.ramadan.countdownTitle')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 justify-items-center">
                  {[
                    { label: t('pages.ramadan.days'), value: countdown.days },
                    { label: t('pages.ramadan.hours'), value: countdown.hours },
                    { label: t('pages.ramadan.minutes'), value: countdown.minutes },
                    { label: t('pages.ramadan.seconds'), value: countdown.seconds },
                  ].map((part) => (
                    <div key={part.label}>
                      <motion.p
                        key={`${part.label}-${part.value}`}
                        animate={reduceMotion ? undefined : countPulse}
                        className="font-display-h1-mobile text-display-h1-mobile text-primary tabular-nums dark:text-dark-green"
                      >
                        {part.value}
                      </motion.p>
                      <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                        {part.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="font-body-md text-body-md text-stone mt-4 dark:text-dark-text-secondary">
                  {t('pages.ramadan.ramadanYear', { year: countdown.ramadanHijriYear })}
                </p>
              </>
            )}
          </HoverCard>
        )}

        {showFastingTimes && (
          <div className="relative mb-8 rounded-xl overflow-hidden bg-primary-container text-paper-white p-8 dark:bg-dark-surface dark:text-dark-text dark:border dark:border-dark-border">
            <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-primary-container mb-4 dark:text-dark-text-secondary">
              {t('pages.ramadan.today')}
            </p>
            {data && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-body-md text-body-md text-on-primary-container opacity-80 dark:text-dark-text-secondary">
                    {t('pages.ramadan.suhoor')}
                  </p>
                  <p className="font-display-h1-mobile text-display-h1-mobile font-light dark:text-dark-text">
                    {formatTime12(data.timings.Fajr)}
                  </p>
                </div>
                <div>
                  <p className="font-body-md text-body-md text-on-primary-container opacity-80 dark:text-dark-text-secondary">
                    {t('pages.ramadan.iftar')}
                  </p>
                  <p className="font-display-h1-mobile text-display-h1-mobile font-light dark:text-dark-text">
                    {formatTime12(data.timings.Maghrib)}
                  </p>
                </div>
              </div>
            )}
            {data && (
              <p className="font-label-sm text-label-sm text-on-primary-container opacity-80 mt-6 dark:text-dark-text-secondary">
                {t('pages.ramadan.imsakWarning', { time: formatTime12(data.timings.Imsak) })}
              </p>
            )}
          </div>
        )}

        {!showFastingTimes && countdown && !countdown.inRamadan && (
          <HoverCard className="p-6 mb-8 dark:bg-dark-surface dark:border-dark-border">
            <p className="font-body-md text-body-md text-ink-soft text-center dark:text-dark-text-secondary">
              {t('pages.ramadan.fastingTimesHint')}
            </p>
          </HoverCard>
        )}

        <HoverCard className="p-6 mb-8 dark:bg-dark-surface dark:border-dark-border">
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black mb-1 dark:text-dark-text">
            {t('pages.ramadan.calendarTitle')}
          </h2>
          <p className="font-body-md text-body-md text-stone mb-4 dark:text-dark-text-secondary">
            {t('pages.ramadan.calendarSubtitle', { year: ramadanHijriYear })}
          </p>

          <AsyncState
            loading={calendarLoading || !data?.date.hijri}
            error={calendarError}
            onRetry={loadCalendar}
            loadingFallback={<Skeleton className="h-64 w-full rounded-xl" />}
          >
            <StaggerList className="grid grid-cols-7 gap-0.5 sm:gap-2">
              {WEEKDAY_KEYS.map((key) => (
                <div
                  key={key}
                  className="text-center font-label-sm text-[10px] sm:text-label-sm text-stone py-1.5 sm:py-2 truncate dark:text-dark-text-secondary"
                >
                  {t(key)}
                </div>
              ))}
              {Array.from({ length: calendarStartPad }).map((_, i) => (
                <div key={`pad-${i}`} aria-hidden="true" />
              ))}
              {calendarDays.map((day) => {
                const dayNum = Number(day.day)
                const isToday = todayRamadanDay === dayNum
                return (
                  <StaggerListItem key={day.date}>
                  <div
                    className={cn(
                      'aspect-square rounded-lg p-0.5 sm:p-2 flex flex-col items-center justify-center text-center',
                      isToday
                        ? 'bg-secondary text-on-secondary font-semibold dark:bg-dark-green dark:text-dark-bg'
                        : 'bg-cream-deep text-stone dark:bg-dark-bg dark:text-dark-text-secondary',
                    )}
                  >
                    <span className="text-sm sm:font-heading-h3 sm:text-heading-h3 font-semibold leading-none">{dayNum}</span>
                    <span className="hidden sm:block font-label-sm text-label-sm opacity-70 text-[10px] leading-tight mt-0.5">
                      {formatGregorianLabel(day.gregorianDate)}
                    </span>
                  </div>
                  </StaggerListItem>
                )
              })}
            </StaggerList>
          </AsyncState>
        </HoverCard>

        {ramadanDuas.length > 0 && (
          <HoverCard className="p-6 dark:bg-dark-surface dark:border-dark-border">
            <h2 className="font-heading-h3 text-heading-h3 text-ink-black mb-4 dark:text-dark-text">
              {t('pages.ramadan.duasTitle')}
            </h2>
            <StaggerList className="space-y-0">
            {ramadanDuas.map((dua) => (
              <StaggerListItem key={dua.id}>
              <div
                className="mb-6 last:mb-0 pb-6 last:pb-0 border-b border-hairline last:border-0 dark:border-dark-border"
              >
                <ArabicText className="mb-2 text-primary dark:text-dark-green">{dua.arabic}</ArabicText>
                <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
                  {dua.translation}
                </p>
                <p className="font-label-sm text-label-sm text-stone mt-1 dark:text-dark-text-secondary">
                  {dua.reference}
                </p>
              </div>
              </StaggerListItem>
            ))}
            </StaggerList>
          </HoverCard>
        )}

        <div className="mt-8">
          <AttributionChip source="AlAdhan API" url="https://aladhan.com/prayer-times-api" />
        </div>
      </AsyncState>
    </PageShell>
  )
}
