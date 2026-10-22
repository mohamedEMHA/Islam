import { apiFetch } from './client'
import type { PrayerTimesResponse } from '@/types/prayer'
import type { Ayah, AyahMetadata } from '@/types/quran'

const BASE = 'https://api.aladhan.com/v1'
/** Quran text and ayah metadata (AlQuran Cloud, Islamic Network / AlAdhan ecosystem). */
const QURAN_BASE = 'https://api.alquran.cloud/v1'

export interface AlAdhanTimingsParams {
  latitude: number
  longitude: number
  method?: number
  school?: 0 | 1
  tune?: string
  adjustment?: number
  latitudeAdjustmentMethod?: number
}

interface AlAdhanTimingsWrapper {
  code: number
  status: string
  data: PrayerTimesResponse
}

export async function getPrayerTimes(
  params: AlAdhanTimingsParams,
): Promise<PrayerTimesResponse> {
  const search = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    method: String(params.method ?? 2),
    school: String(params.school ?? 0),
  })
  if (params.tune) search.set('tune', params.tune)
  if (params.adjustment) search.set('adjustment', String(params.adjustment))
  if (params.latitudeAdjustmentMethod) {
    search.set('latitudeAdjustmentMethod', String(params.latitudeAdjustmentMethod))
  }

  const result = await apiFetch<AlAdhanTimingsWrapper>(
    `${BASE}/timings?${search}`,
    { source: 'AlAdhan API' },
  )
  return result.data
}

export interface HijriCalendarDay {
  date: string
  format: string
  day: string
  weekday: { en: string; ar: string }
  gregorianDate: string
  month: { number: number; en: string; ar: string }
  year: string
  designation: { abbreviated: string; expanded: string }
  holidays: string[]
}

export type HijriCalendarParams = Pick<
  AlAdhanTimingsParams,
  'latitude' | 'longitude' | 'method' | 'school' | 'adjustment' | 'latitudeAdjustmentMethod'
>

export function buildHijriCalendarParams(
  location: { latitude: number; longitude: number },
  settings: {
    calculationMethod: number
    madhab: 0 | 1
    hijriAdjustment: number
    highLatitudeRule: number
  },
): HijriCalendarParams {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    method: settings.calculationMethod,
    school: settings.madhab,
    adjustment: settings.hijriAdjustment,
    latitudeAdjustmentMethod: settings.highLatitudeRule,
  }
}

interface HijriCalendarApiEntry {
  date: {
    hijri: {
      date: string
      format: string
      day: string
      weekday: { en: string; ar: string }
      month: { number: number; en: string; ar: string }
      year: string
      designation: { abbreviated: string; expanded: string }
      holidays: string[]
    }
    gregorian: {
      date: string
      weekday: { en: string }
    }
  }
}

function mapHijriCalendarEntry(entry: HijriCalendarApiEntry): HijriCalendarDay {
  const hijri = entry.date.hijri
  return {
    date: hijri.date,
    format: hijri.format,
    day: hijri.day,
    weekday: {
      en: entry.date.gregorian.weekday?.en ?? hijri.weekday.en,
      ar: hijri.weekday.ar,
    },
    gregorianDate: entry.date.gregorian.date,
    month: hijri.month,
    year: hijri.year,
    designation: hijri.designation,
    holidays: hijri.holidays ?? [],
  }
}

export async function getHijriCalendar(
  year: number,
  month: number,
  params: HijriCalendarParams,
): Promise<HijriCalendarDay[]> {
  const search = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    method: String(params.method ?? 2),
    school: String(params.school ?? 0),
    adjustment: String(params.adjustment ?? 0),
  })
  if (params.latitudeAdjustmentMethod) {
    search.set('latitudeAdjustmentMethod', String(params.latitudeAdjustmentMethod))
  }

  const result = await apiFetch<{ code: number; data: HijriCalendarApiEntry[] }>(
    `${BASE}/hijriCalendar/${year}/${month}?${search}`,
    { source: 'AlAdhan API' },
  )
  return result.data.map(mapHijriCalendarEntry)
}

export interface AsmaName {
  number: number
  name: string
  transliteration: string
  en: { meaning: string }
}

export async function getAsmaAlHusna(): Promise<AsmaName[]> {
  const result = await apiFetch<{ code: number; data: AsmaName[] }>(
    `${BASE}/asmaAlHusna`,
    { source: 'AlAdhan API' },
  )
  return result.data
}

export async function hijriToGregorian(
  day: number,
  month: number,
  year: number,
): Promise<string> {
  const dd = String(day).padStart(2, '0')
  const mm = String(month).padStart(2, '0')
  const result = await apiFetch<{
    code: number
    data: { gregorian: { date: string } }
  }>(`${BASE}/hToG/${dd}-${mm}-${year}`, { source: 'AlAdhan API' })
  return result.data.gregorian.date
}

export interface QiblaDirection {
  latitude: number
  longitude: number
  direction: number
}

export async function getQiblaDirection(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<QiblaDirection> {
  const result = await apiFetch<{
    code: number
    status: string
    data: QiblaDirection
  }>(`${BASE}/qibla/${latitude}/${longitude}`, {
    source: 'AlAdhan API',
    signal,
  })
  return result.data
}

interface AlquranAyahPayload {
  number: number
  numberInSurah: number
  text: string
  juz?: number
  manzil?: number
  page?: number
  ruku?: number
  hizbQuarter?: number
}

interface AlquranSurahPayload {
  code: number
  data: {
    ayahs: AlquranAyahPayload[]
  }
}

function mapAyahMetadata(ayah: AlquranAyahPayload): AyahMetadata {
  return {
    numberInSurah: ayah.numberInSurah,
    juz: ayah.juz,
    manzil: ayah.manzil,
    page: ayah.page,
    ruku: ayah.ruku,
    hizbQuarter: ayah.hizbQuarter,
  }
}

export async function getSurahAyahMetadata(
  surahNumber: number,
): Promise<Record<number, AyahMetadata>> {
  const result = await apiFetch<AlquranSurahPayload>(
    `${QURAN_BASE}/surah/${surahNumber}/quran-uthmani`,
    { source: 'AlQuran Cloud' },
  )

  const metadata: Record<number, AyahMetadata> = {}
  for (const ayah of result.data.ayahs) {
    metadata[ayah.numberInSurah] = mapAyahMetadata(ayah)
  }
  return metadata
}

export async function getSurahTranslationAlquran(
  surahNumber: number,
  edition: string,
): Promise<Ayah[]> {
  const result = await apiFetch<AlquranSurahPayload>(
    `${QURAN_BASE}/surah/${surahNumber}/${edition}`,
    { source: 'AlQuran Cloud' },
  )

  return result.data.ayahs.map((ayah) => ({
    number: ayah.number,
    numberInSurah: ayah.numberInSurah,
    text: ayah.text,
  }))
}
