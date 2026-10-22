import type { PrayerName, PrayerTimings } from '@/types/prayer'
import { parseAlAdhanTime, browserTimeZone } from '@/lib/utils/prayerTime'

export const NOTIFIABLE_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

export type NotifiablePrayer = (typeof NOTIFIABLE_PRAYERS)[number]

export const PRAYER_NOTIFICATION_KEYS = {
  Fajr: 'fajr',
  Dhuhr: 'dhuhr',
  Asr: 'asr',
  Maghrib: 'maghrib',
  Isha: 'isha',
} as const satisfies Record<NotifiablePrayer, 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>

export type PrayerNotificationKey = (typeof PRAYER_NOTIFICATION_KEYS)[NotifiablePrayer]

export const CHECK_INTERVAL_MS = 15000
export const NOTIFY_WINDOW_MS = 60000
export const CATCH_UP_WINDOW_MS = 5 * 60_000
export const MORNING_REMINDER_HOUR = 8
export const MORNING_REMINDER_MINUTE = 0

export function parsePrayerTime(
  timeStr: string,
  timeZone = browserTimeZone(),
  baseDate = new Date(),
): Date {
  return parseAlAdhanTime(timeStr, timeZone, baseDate)
}

export function isWithinWindow(now: Date, target: Date, windowMs = NOTIFY_WINDOW_MS): boolean {
  return Math.abs(now.getTime() - target.getTime()) < windowMs
}

export function isMorningReminderWindow(now: Date): boolean {
  const target = new Date(now)
  target.setHours(MORNING_REMINDER_HOUR, MORNING_REMINDER_MINUTE, 0, 0)
  return isWithinWindow(now, target)
}

export function findDuePrayer(
  now: Date,
  timings: PrayerTimings,
  enabled: Record<PrayerNotificationKey, boolean>,
  wasNotified: (prayer: string) => boolean,
  timeZone = browserTimeZone(),
  windowMs = NOTIFY_WINDOW_MS,
): NotifiablePrayer | null {
  for (const prayer of NOTIFIABLE_PRAYERS) {
    const key = PRAYER_NOTIFICATION_KEYS[prayer]
    if (!enabled[key]) continue
    const time = timings[prayer as PrayerName]
    if (!time) continue
    const prayerDate = parsePrayerTime(time, timeZone, now)
    if (isWithinWindow(now, prayerDate, windowMs) && !wasNotified(prayer)) {
      return prayer
    }
  }
  return null
}
