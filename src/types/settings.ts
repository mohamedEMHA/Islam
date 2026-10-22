import type { QuranScript } from './quran'

export type Theme = 'light' | 'dark'
export type Madhab = 0 | 1
export type QuranReaderMode = 'study' | 'mushaf'

export interface NotificationSettings {
  fajr: boolean
  dhuhr: boolean
  asr: boolean
  maghrib: boolean
  isha: boolean
  dailyHadith: boolean
  whiteDays: boolean
  monThuFasting: boolean
  muezzinId: string
  silentNotifications: boolean
}

export interface UserSettings {
  calculationMethod: number
  madhab: Madhab
  tune: number[]
  highLatitudeRule: number
  hijriAdjustment: number
  theme: Theme
  language: string
  quranFontSize: number
  quranScript: QuranScript
  quranReaderMode: QuranReaderMode
  reciterId: string
  translationEdition: string
  /** When true, language changes do not overwrite translationEdition. */
  translationEditionTouched: boolean
  notifications: NotificationSettings
  location: {
    latitude: number
    longitude: number
    city: string
    country: string
  } | null
  onboardingComplete: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  calculationMethod: 2,
  madhab: 0,
  tune: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  highLatitudeRule: 1,
  hijriAdjustment: 0,
  theme: 'light',
  language: 'en',
  quranFontSize: 100,
  quranScript: 'uthmani',
  quranReaderMode: 'study',
  reciterId: 'mishary',
  translationEdition: 'en.sahih',
  translationEditionTouched: false,
  notifications: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    whiteDays: false,
    dailyHadith: false,
    monThuFasting: false,
    muezzinId: 'mishary',
    silentNotifications: false,
  },
  location: null,
  onboardingComplete: false,
}

export const HIGH_LATITUDE_RULES = [
  { id: 1, name: 'Middle of the Night' },
  { id: 2, name: 'One Seventh of the Night' },
  { id: 3, name: 'Angle Based Method' },
] as const

export const CALCULATION_METHODS = [
  { id: 0, name: 'Jafari / Shia Ithna Ashari' },
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League (MWL)' },
  { id: 4, name: 'Umm Al-Qura University, Makkah' },
  { id: 5, name: 'Egyptian General Authority of Survey' },
  { id: 7, name: 'Institute of Geophysics, University of Tehran' },
  { id: 8, name: 'Gulf Region' },
  { id: 9, name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Majlis Ugama Islam Singapura' },
  { id: 12, name: 'Union Organization islamic de France' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey' },
  { id: 14, name: 'Spiritual Administration of Muslims of Russia' },
  { id: 15, name: 'Moonsighting Committee Worldwide' },
] as const
