import { useEffect, useRef } from 'react'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { DEFAULT_LOCATION, usePrayerTimesStore } from '@/lib/stores/prayerTimesStore'
import { browserTimeZone, getMsUntilNextMidnight } from '@/lib/utils/prayerTime'

export function usePrayerTimes() {
  const settings = useSettingsStore()
  const hasUserLocation = settings.location != null
  const location = settings.location ?? DEFAULT_LOCATION
  const settingsKey = [
    location.latitude,
    location.longitude,
    settings.calculationMethod,
    settings.madhab,
    settings.tune.join(','),
    settings.hijriAdjustment,
    settings.highLatitudeRule,
  ].join('|')

  const data = usePrayerTimesStore((s) => s.data)
  const nextPrayer = usePrayerTimesStore((s) => s.nextPrayer)
  const loading = usePrayerTimesStore((s) => s.loading)
  const error = usePrayerTimesStore((s) => s.error)
  const fetchTimes = usePrayerTimesStore((s) => s.fetchTimes)
  const tickNextPrayer = usePrayerTimesStore((s) => s.tickNextPrayer)
  const midnightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const params = {
    latitude: location.latitude,
    longitude: location.longitude,
    method: settings.calculationMethod,
    school: settings.madhab,
    tune: settings.tune.join(','),
    adjustment: settings.hijriAdjustment,
    latitudeAdjustmentMethod: settings.highLatitudeRule,
  }

  useEffect(() => {
    void fetchTimes(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settingsKey captures location/method inputs
  }, [settingsKey, fetchTimes])

  useEffect(() => {
    if (!data) return
    const interval = setInterval(tickNextPrayer, 1000)
    return () => clearInterval(interval)
  }, [data, tickNextPrayer])

  useEffect(() => {
    const scheduleMidnight = () => {
      if (midnightTimer.current) clearTimeout(midnightTimer.current)
      const tz = data?.meta.timezone ?? browserTimeZone()
      const ms = getMsUntilNextMidnight(tz)
      midnightTimer.current = setTimeout(() => {
        void fetchTimes(params, { force: true })
        scheduleMidnight()
      }, ms + 1_000)
    }
    scheduleMidnight()

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void fetchTimes(params)
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (midnightTimer.current) clearTimeout(midnightTimer.current)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settingsKey drives param identity
  }, [settingsKey, data?.meta.timezone, fetchTimes])

  const refetch = () => fetchTimes(params, { force: true })

  return {
    data,
    nextPrayer,
    loading,
    error,
    location,
    hasUserLocation,
    refetch,
  }
}
