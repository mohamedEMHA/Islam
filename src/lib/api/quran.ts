import { apiFetch } from './client'
import { getSurahTranslationAlquran } from './aladhan'
import { sanitizeTafsirHtml } from '@/lib/utils/sanitizeHtml'
import type { SurahMeta, Ayah, AyahWord, QuranScript } from '@/types/quran'

const QURAN_API = 'https://api.quran.com/api/v4'
const QURAN_CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1'
const DEFAULT_TAFSIR_ID = 169

export type TafsirEdition = 'english_ibn_kathir' | 'arabic_jalalayn' | 'indonesian_jalalayn'

const FAWAZ_TAFSIR_EDITIONS: Record<Exclude<TafsirEdition, 'english_ibn_kathir'>, string> = {
  arabic_jalalayn: 'ara-jalaladdinalmah',
  indonesian_jalalayn: 'ind-jalaladdinalmah',
}

export const TAFSIR_ATTRIBUTION: Record<
  TafsirEdition,
  { source: string; url: string; labelKey: string }
> = {
  english_ibn_kathir: {
    source: 'quran.com',
    url: 'https://quran.com',
    labelKey: 'pages.tafsir.sourceEnglish',
  },
  arabic_jalalayn: {
    source: 'fawazahmed0/quran-api',
    url: 'https://github.com/fawazahmed0/quran-api',
    labelKey: 'pages.tafsir.sourceArabic',
  },
  indonesian_jalalayn: {
    source: 'fawazahmed0/quran-api',
    url: 'https://github.com/fawazahmed0/quran-api',
    labelKey: 'pages.tafsir.sourceIndonesian',
  },
}

interface TafsirChapterEntry {
  chapter: number
  verse: number
  text: string
}

interface TafsirSurahResponse {
  chapter?: TafsirChapterEntry[]
  surahs?: Array<{ ayahs: Array<{ numberInSurah: number; text: string }> }>
}

export function getTafsirEditionForLanguage(language: string): TafsirEdition {
  const base = language.split('-')[0].toLowerCase()
  if (base === 'ar') return 'arabic_jalalayn'
  if (base === 'id') return 'indonesian_jalalayn'
  return 'english_ibn_kathir'
}

function parseSurahTafsirMap(
  data: TafsirSurahResponse,
  surahNumber: number,
): Record<number, string> {
  const result: Record<number, string> = {}

  if (data.chapter) {
    for (const entry of data.chapter) {
      if (entry.chapter === surahNumber && entry.text) {
        result[entry.verse] = sanitizeTafsirHtml(entry.text)
      }
    }
  }

  if (Object.keys(result).length === 0 && data.surahs?.[0]?.ayahs) {
    for (const ayah of data.surahs[0].ayahs) {
      if (ayah.text) {
        result[ayah.numberInSurah] = sanitizeTafsirHtml(ayah.text)
      }
    }
  }

  return result
}

export async function getSurahTafsir(
  surahNumber: number,
  edition: TafsirEdition,
): Promise<Record<number, string>> {
  if (edition === 'english_ibn_kathir') {
    return {}
  }

  const editionId = FAWAZ_TAFSIR_EDITIONS[edition]
  const data = await apiFetch<TafsirSurahResponse>(
    `${QURAN_CDN}/editions/${editionId}/${surahNumber}.json`,
    { source: 'fawazahmed0/quran-api' },
  )

  return parseSurahTafsirMap(data, surahNumber)
}

async function getAyahTafsirFromQuranCom(
  surahNumber: number,
  ayahNumber: number,
): Promise<string> {
  const verseKey = `${surahNumber}:${ayahNumber}`
  const data = await apiFetch<{ tafsir: { text: string } }>(
    `${QURAN_API}/tafsirs/${DEFAULT_TAFSIR_ID}/by_ayah/${verseKey}`,
    { source: 'quran.com' },
  )

  const text = sanitizeTafsirHtml(data.tafsir.text)
  if (!text) {
    throw new Error('Tafsir not found')
  }

  return text
}

const SCRIPT_ENDPOINTS: Record<QuranScript, string> = {
  uthmani: 'uthmani',
  indopak: 'indopak',
}

const TRANSLATION_RESOURCE_IDS: Record<string, number> = {
  'en.sahih': 20,
  'en.pickthall': 19,
  'en.yusufali': 22,
  'ur.ahmedali': 234,
  'id.indonesian': 134,
  'fr.hamidullah': 31,
}

const ALQURAN_TRANSLATION_EDITIONS = new Set(['uz.sodik'])

const RECITER_AUDIO_PATHS: Record<string, string> = {
  mishary: 'mishari_al_afasy/murattal',
  sudais: 'abdurrahmaan_as_sudais/murattal',
  husary: 'khalil_al_husary/murattal',
}

interface QuranComChapter {
  id: number
  revelation_place: string
  name_simple: string
  name_arabic: string
  verses_count: number
  translated_name: { name: string }
}

interface QuranComArabicVerse {
  id: number
  verse_key: string
  text_uthmani?: string
  text_indopak?: string
}

interface QuranComTranslatedVerse {
  verse_number: number
  translations: Array<{ text: string }>
}

interface QuranComWord {
  position: number
  text_uthmani?: string
  text?: string
  translation?: { text: string }
  transliteration?: { text: string }
  char_type_name?: string
}

function resolveTranslationId(edition: string): number {
  return TRANSLATION_RESOURCE_IDS[edition] ?? 20
}

function verseNumberFromKey(verseKey: string): number {
  const parts = verseKey.split(':')
  return Number(parts[1] ?? 0)
}

function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>[\d]*<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function mapArabicAyahs(verses: QuranComArabicVerse[], script: QuranScript): Ayah[] {
  return verses.map((verse) => {
    const numberInSurah = verseNumberFromKey(verse.verse_key)
    const text =
      script === 'indopak'
        ? verse.text_indopak ?? verse.text_uthmani ?? ''
        : verse.text_uthmani ?? verse.text_indopak ?? ''

    return {
      number: verse.id,
      numberInSurah,
      text: stripHtml(text),
    }
  })
}

function mapTranslationAyahs(verses: QuranComTranslatedVerse[], surahNumber: number): Ayah[] {
  return verses.map((verse) => ({
    number: surahNumber * 1000 + verse.verse_number,
    numberInSurah: verse.verse_number,
    text: stripHtml(verse.translations[0]?.text ?? ''),
  }))
}

async function getSurahTranslationQuranCom(
  surahNumber: number,
  translationEdition: string,
  signal?: AbortSignal,
): Promise<Ayah[]> {
  const translationId = resolveTranslationId(translationEdition)
  const verses: QuranComTranslatedVerse[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const data = await apiFetch<{
      verses: QuranComTranslatedVerse[]
      pagination?: { total_pages?: number; next_page?: number | null }
    }>(
      `${QURAN_API}/verses/by_chapter/${surahNumber}?words=false&translations=${translationId}&per_page=50&page=${page}`,
      { source: 'quran.com', signal },
    )

    verses.push(...(data.verses ?? []))
    totalPages = data.pagination?.total_pages ?? page
    page += 1

    // Safety against bad pagination payloads.
    if (page > 40) break
  }

  return mapTranslationAyahs(verses, surahNumber)
}

export async function getSurahList(language = 'en'): Promise<SurahMeta[]> {
  const lang = language.split('-')[0].toLowerCase()
  const apiLang = ['ar', 'ur', 'id', 'fr', 'en'].includes(lang) ? lang : 'en'
  const data = await apiFetch<{ chapters: QuranComChapter[] }>(
    `${QURAN_API}/chapters?language=${apiLang}`,
    { source: 'quran.com' },
  )

  return data.chapters.map((chapter) => ({
    number: chapter.id,
    name: chapter.name_arabic,
    englishName: chapter.name_simple,
    englishNameTranslation: chapter.translated_name.name,
    numberOfAyahs: chapter.verses_count,
    revelationType: chapter.revelation_place === 'makkah' ? 'Meccan' : 'Medinan',
  }))
}

export async function getSurah(
  surahNumber: number,
  script: QuranScript,
  translationEdition = 'en.sahih',
  signal?: AbortSignal,
): Promise<{ arabic: Ayah[]; translation: Ayah[] }> {
  const scriptEndpoint = SCRIPT_ENDPOINTS[script]

  const arabicPromise = apiFetch<{ verses: QuranComArabicVerse[] }>(
    `${QURAN_API}/quran/verses/${scriptEndpoint}?chapter_number=${surahNumber}`,
    { source: 'quran.com', signal },
  )

  const translationPromise = ALQURAN_TRANSLATION_EDITIONS.has(translationEdition)
    ? getSurahTranslationAlquran(surahNumber, translationEdition)
    : getSurahTranslationQuranCom(surahNumber, translationEdition, signal)

  const [arabicData, translation] = await Promise.all([arabicPromise, translationPromise])

  return {
    arabic: mapArabicAyahs(arabicData.verses, script),
    translation,
  }
}

export function getAudioUrl(surahNumber: number, reciterId: string): string {
  const path = RECITER_AUDIO_PATHS[reciterId] ?? RECITER_AUDIO_PATHS.mishary
  return `https://download.quranicaudio.com/qdc/${path}/${surahNumber}.mp3`
}

/** Quran.com / Qurancdn reciter IDs for full-chapter audio with verse timings. */
const RECITER_TIMING_IDS: Record<string, number> = {
  mishary: 7,
  sudais: 3,
  husary: 6,
}

export interface VerseTiming {
  ayahNumber: number
  /** Start time in seconds */
  start: number
  /** End time in seconds */
  end: number
}

interface QurancdnAudioFile {
  duration?: number
  verse_timings?: Array<{
    verse_key: string
    timestamp_from: number
    timestamp_to: number
  }>
}

export async function getVerseTimings(
  surahNumber: number,
  reciterId: string,
  signal?: AbortSignal,
): Promise<VerseTiming[]> {
  const timingReciterId = RECITER_TIMING_IDS[reciterId] ?? RECITER_TIMING_IDS.mishary
  const data = await apiFetch<{ audio_files?: QurancdnAudioFile[] }>(
    `https://api.qurancdn.com/api/qdc/audio/reciters/${timingReciterId}/audio_files?chapter=${surahNumber}&segments=true`,
    { source: 'quran.com', signal },
  )

  const timings = data.audio_files?.[0]?.verse_timings ?? []
  return timings
    .map((timing) => {
      const ayahNumber = Number(timing.verse_key.split(':')[1] ?? 0)
      return {
        ayahNumber,
        start: timing.timestamp_from / 1000,
        end: timing.timestamp_to / 1000,
      }
    })
    .filter((timing) => timing.ayahNumber > 0)
    .sort((a, b) => a.ayahNumber - b.ayahNumber)
}

export function findAyahForTime(timings: VerseTiming[], currentTime: number): number | null {
  if (timings.length === 0) return null

  for (const timing of timings) {
    if (currentTime >= timing.start && currentTime < timing.end) {
      return timing.ayahNumber
    }
  }

  if (currentTime < timings[0].start) return timings[0].ayahNumber
  return timings[timings.length - 1].ayahNumber
}

export const RECITERS = [
  { id: 'mishary', name: 'Mishary Rashid Alafasy', style: 'Murattal' },
  { id: 'sudais', name: 'Abdur-Rahman As-Sudais', style: 'Murattal' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', style: 'Murattal' },
] as const

export const TRANSLATIONS = [
  { id: 'en.sahih', name: 'Sahih International' },
  { id: 'en.pickthall', name: 'Pickthall' },
  { id: 'en.yusufali', name: 'Yusuf Ali' },
  { id: 'ur.ahmedali', name: 'Urdu (Ahmed Ali)' },
  { id: 'id.indonesian', name: 'Indonesian' },
  { id: 'fr.hamidullah', name: 'French (Hamidullah)' },
  { id: 'uz.sodik', name: 'Uzbek (Muhammad Sodik)' },
] as const

export const DEFAULT_TRANSLATION_BY_LANGUAGE: Record<string, string> = {
  en: 'en.sahih',
  ar: 'en.sahih',
  ur: 'ur.ahmedali',
  id: 'id.indonesian',
  fr: 'fr.hamidullah',
}

export function getDefaultTranslationEdition(language: string): string {
  const base = language.split('-')[0].toLowerCase()
  return DEFAULT_TRANSLATION_BY_LANGUAGE[base] ?? DEFAULT_TRANSLATION_BY_LANGUAGE.en
}

/** True when tafsir for this language falls back to English Ibn Kathir. */
export function isTafsirEnglishFallback(language: string): boolean {
  return getTafsirEditionForLanguage(language) === 'english_ibn_kathir'
}

export async function getAyahTafsir(
  surahNumber: number,
  ayahNumber: number,
  edition: TafsirEdition = 'english_ibn_kathir',
): Promise<string> {
  if (edition === 'english_ibn_kathir') {
    return getAyahTafsirFromQuranCom(surahNumber, ayahNumber)
  }

  const surahTafsir = await getSurahTafsir(surahNumber, edition)
  const text = surahTafsir[ayahNumber]

  if (!text) {
    throw new Error('Tafsir not found')
  }

  return text
}

export async function getAyahWords(surahNumber: number, ayahNumber: number): Promise<AyahWord[]> {
  const verseKey = `${surahNumber}:${ayahNumber}`
  const primaryUrl = `${QURAN_API}/quran/words?verse_key=${verseKey}`
  const fallbackUrl = `${QURAN_API}/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,translation`

  let data: { words?: QuranComWord[]; verse?: { words: QuranComWord[] } } | null = null

  try {
    data = await apiFetch<{ words?: QuranComWord[] }>(primaryUrl, {
      source: 'quran.com',
    })
  } catch {
    data = await apiFetch<{ verse: { words: QuranComWord[] } }>(fallbackUrl, {
      source: 'quran.com',
    })
  }

  const rawWords = data?.words ?? data?.verse?.words ?? []

  return rawWords
    .filter((word) => word.char_type_name !== 'end')
    .map((word) => ({
      position: word.position,
      text: word.text_uthmani ?? word.text ?? '',
      translation: stripHtml(word.translation?.text ?? ''),
      transliteration: word.transliteration?.text ?? '',
    }))
}
