export type PrayerName =
  | 'Imsak'
  | 'Fajr'
  | 'Sunrise'
  | 'Dhuhr'
  | 'Asr'
  | 'Maghrib'
  | 'Sunset'
  | 'Isha'
  | 'Midnight'

export const PRAYER_ORDER: PrayerName[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
]

export const TUNE_PRAYER_ORDER: PrayerName[] = [
  'Imsak',
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Sunset',
  'Isha',
  'Midnight',
]

export interface PrayerTimings {
  Imsak: string
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Sunset: string
  Isha: string
  Midnight: string
}

export interface PrayerTimesResponse {
  timings: PrayerTimings
  date: {
    readable: string
    hijri: {
      day: string
      month: { number: number; en: string; ar: string }
      year: string
    }
    gregorian: { date: string }
  }
  meta: {
    latitude: number
    longitude: number
    timezone: string
    method: { id: number; name: string }
  }
}

export interface NextPrayerInfo {
  name: PrayerName
  time: string
  countdownSeconds: number
  progress: number
}

export interface LocationCoords {
  latitude: number
  longitude: number
  city?: string
  country?: string
}
