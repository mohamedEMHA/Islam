import { describe, expect, it } from 'vitest'
import {
  findDuePrayer,
  isMorningReminderWindow,
  isWithinWindow,
  parsePrayerTime,
} from '@/lib/notifications/schedule'
import type { PrayerTimings } from '@/types/prayer'

const sampleTimings: PrayerTimings = {
  Imsak: '04:30',
  Fajr: '04:45',
  Sunrise: '06:10',
  Dhuhr: '12:30',
  Asr: '15:45',
  Maghrib: '18:20',
  Sunset: '18:25',
  Isha: '19:45',
  Midnight: '23:30',
}

describe('notification schedule', () => {
  it('parses HH:mm prayer times', () => {
    const parsed = parsePrayerTime('12:30')
    expect(parsed.getHours()).toBe(12)
    expect(parsed.getMinutes()).toBe(30)
  })

  it('detects prayer within one minute window', () => {
    const now = new Date()
    now.setHours(12, 30, 20, 0)
    const target = parsePrayerTime('12:30')
    expect(isWithinWindow(now, target)).toBe(true)
  })

  it('finds due enabled prayer and skips already notified', () => {
    const now = new Date()
    now.setHours(12, 30, 10, 0)
    const due = findDuePrayer(
      now,
      sampleTimings,
      { fajr: false, dhuhr: true, asr: false, maghrib: false, isha: false },
      () => false,
    )
    expect(due).toBe('Dhuhr')

    const none = findDuePrayer(
      now,
      sampleTimings,
      { fajr: false, dhuhr: true, asr: false, maghrib: false, isha: false },
      (prayer) => prayer === 'Dhuhr',
    )
    expect(none).toBeNull()
  })

  it('matches morning reminder window instead of exact minute only', () => {
    const at815 = new Date()
    at815.setHours(8, 0, 15, 0)
    expect(isMorningReminderWindow(at815)).toBe(true)

    const at759 = new Date()
    at759.setHours(7, 59, 45, 0)
    expect(isMorningReminderWindow(at759)).toBe(true)

    const at830 = new Date()
    at830.setHours(8, 30, 0, 0)
    expect(isMorningReminderWindow(at830)).toBe(false)
  })
})
