import { describe, expect, it } from 'vitest'
import {
  formatDateInTimeZone,
  parseAlAdhanTime,
  stripAlAdhanTime,
  zonedWallTimeToUtc,
} from '@/lib/utils/prayerTime'
import { buildPrayerTimesCacheKey, getNextPrayer } from '@/lib/stores/prayerTimesStore'
import type { PrayerTimings } from '@/types/prayer'

describe('prayerTime utils', () => {
  it('strips AlAdhan timezone suffixes', () => {
    expect(stripAlAdhanTime('05:12 (EET)')).toBe('05:12')
    expect(stripAlAdhanTime(' 18:30 ')).toBe('18:30')
  })

  it('parses suffixed times without NaN', () => {
    const date = parseAlAdhanTime('05:12 (EET)', 'Europe/Athens', new Date('2026-06-15T12:00:00Z'))
    expect(Number.isNaN(date.getTime())).toBe(false)
  })

  it('interprets wall clock in location timezone, not browser UTC', () => {
    // 12:00 Mecca on a fixed calendar day
    const mecca = zonedWallTimeToUtc(2026, 6, 15, 12, 0, 'Asia/Riyadh')
    const nyc = zonedWallTimeToUtc(2026, 6, 15, 12, 0, 'America/New_York')
    expect(mecca.getTime()).not.toBe(nyc.getTime())
    expect(formatDateInTimeZone(mecca, 'Asia/Riyadh')).toBe('2026-06-15')
  })

  it('includes date in prayer cache key so midnight forces refresh', () => {
    const params = { latitude: 21.4, longitude: 39.8, method: 4 }
    const a = buildPrayerTimesCacheKey(params, '2026-06-15')
    const b = buildPrayerTimesCacheKey(params, '2026-06-16')
    expect(a).not.toBe(b)
    expect(a.startsWith('2026-06-15')).toBe(true)
  })

  it('rolls next prayer to tomorrow Fajr after Isha', () => {
    const timings = {
      Imsak: '04:00',
      Fajr: '04:30',
      Sunrise: '06:00',
      Dhuhr: '12:00',
      Asr: '15:30',
      Maghrib: '18:00',
      Sunset: '18:00',
      Isha: '19:30',
      Midnight: '23:00',
    } satisfies PrayerTimings

    const afterIsha = zonedWallTimeToUtc(2026, 6, 15, 21, 0, 'Europe/Athens')
    const next = getNextPrayer(timings, 'Europe/Athens', afterIsha)
    expect(next.name).toBe('Fajr')
    expect(next.countdownSeconds).toBeGreaterThan(0)
  })
})
