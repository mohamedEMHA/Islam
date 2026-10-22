import { create } from 'zustand'
import { getPrayerTimes, type AlAdhanTimingsParams } from '@/lib/api/aladhan'
import type { NextPrayerInfo, PrayerName, PrayerTimings, PrayerTimesResponse } from '@/types/prayer'
import { PRAYER_ORDER } from '@/types/prayer'
import {
  browserTimeZone,
  formatDateInTimeZone,
  parseAlAdhanTime,
} from '@/lib/utils/prayerTime'

export const DEFAULT_LOCATION = { latitude: 37.9838, longitude: 23.7275, city: 'Athens', country: 'Greece' }

export function getNextPrayer(
  timings: PrayerTimings,
  timeZone: string,
  now = new Date(),
): NextPrayerInfo {
  const displayPrayers = PRAYER_ORDER.filter((p) => p !== 'Sunrise')

  for (let i = 0; i < displayPrayers.length; i++) {
    const name = displayPrayers[i]
    const time = timings[name]
    if (!time) continue
    const prayerDate = parseAlAdhanTime(time, timeZone, now)
    if (prayerDate > now) {
      const prevName = i > 0 ? displayPrayers[i - 1] : displayPrayers[displayPrayers.length - 1]
      const prevTime = timings[prevName]
      let prevDate = parseAlAdhanTime(prevTime, timeZone, now)
      if (prevDate > now) {
        prevDate = new Date(prevDate.getTime() - 86_400_000)
      }
      const totalDuration = prayerDate.getTime() - prevDate.getTime()
      const elapsed = now.getTime() - prevDate.getTime()
      return {
        name: name as PrayerName,
        time,
        countdownSeconds: Math.floor((prayerDate.getTime() - now.getTime()) / 1000),
        progress: Math.min(1, Math.max(0, elapsed / totalDuration)),
      }
    }
  }

  const fajr = timings.Fajr
  const fajrToday = parseAlAdhanTime(fajr, timeZone, now)
  const fajrDate = new Date(fajrToday.getTime() + 86_400_000)
  const ishaDate = parseAlAdhanTime(timings.Isha, timeZone, now)
  const totalDuration = fajrDate.getTime() - ishaDate.getTime()
  const elapsed = now.getTime() - ishaDate.getTime()

  return {
    name: 'Fajr',
    time: fajr,
    countdownSeconds: Math.floor((fajrDate.getTime() - now.getTime()) / 1000),
    progress: Math.min(1, Math.max(0, elapsed / totalDuration)),
  }
}

export function buildPrayerTimesCacheKey(
  params: AlAdhanTimingsParams,
  dateKey: string,
): string {
  return [
    dateKey,
    params.latitude,
    params.longitude,
    params.method ?? 2,
    params.school ?? 0,
    params.tune ?? '',
    params.adjustment ?? 0,
    params.latitudeAdjustmentMethod ?? 1,
  ].join('|')
}

interface PrayerTimesState {
  cacheKey: string | null
  data: PrayerTimesResponse | null
  nextPrayer: NextPrayerInfo | null
  loading: boolean
  error: string | null
  inflightKey: string | null
  requestId: number
  fetchTimes: (params: AlAdhanTimingsParams, options?: { force?: boolean }) => Promise<void>
  tickNextPrayer: () => void
}

export const usePrayerTimesStore = create<PrayerTimesState>((set, get) => ({
  cacheKey: null,
  data: null,
  nextPrayer: null,
  loading: false,
  error: null,
  inflightKey: null,
  requestId: 0,

  fetchTimes: async (params, options) => {
    const guessTz = get().data?.meta.timezone ?? browserTimeZone()
    const dateKey = formatDateInTimeZone(new Date(), guessTz)
    const key = buildPrayerTimesCacheKey(params, dateKey)
    const state = get()

    if (!options?.force && state.cacheKey === key && state.data && !state.error) {
      set({
        nextPrayer: getNextPrayer(state.data.timings, state.data.meta.timezone),
      })
      return
    }

    if (!options?.force && state.inflightKey === key) {
      return
    }

    const requestId = state.requestId + 1
    set({ loading: true, error: null, inflightKey: key, requestId })

    try {
      const result = await getPrayerTimes(params)
      if (get().requestId !== requestId) return

      const tz = result.meta.timezone || guessTz
      const confirmedDate = formatDateInTimeZone(new Date(), tz)
      const confirmedKey = buildPrayerTimesCacheKey(params, confirmedDate)

      set({
        cacheKey: confirmedKey,
        data: result,
        nextPrayer: getNextPrayer(result.timings, tz),
        loading: false,
        error: null,
        inflightKey: null,
      })
    } catch (err) {
      if (get().requestId !== requestId) return
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load prayer times',
        inflightKey: null,
      })
    }
  },

  tickNextPrayer: () => {
    const { data } = get()
    if (!data) return
    set({ nextPrayer: getNextPrayer(data.timings, data.meta.timezone) })
  },
}))
