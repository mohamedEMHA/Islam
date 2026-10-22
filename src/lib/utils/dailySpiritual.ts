export type DailySpiritualTab =
  | 'verse'
  | 'hadith'
  | 'morning_adhkar'
  | 'evening_adhkar'
  | 'after_prayer'

export type UmmahAdhkarCategory = 'morning' | 'evening' | 'after_prayer'

export type UmmahQuranTranslationKey =
  | 'sahih_international'
  | 'pickthall'
  | 'yusuf_ali'
  | 'urdu'
  | 'turkish'
  | 'indonesian'
  | 'french'
  | 'german'
  | 'bengali'
  | 'spanish'
  | 'malay'
  | 'bosnian'

export const AYAH_POOL = [
  { surah: 93, ayah: 7 },
  { surah: 2, ayah: 152 },
  { surah: 2, ayah: 186 },
  { surah: 13, ayah: 28 },
  { surah: 94, ayah: 5 },
  { surah: 94, ayah: 6 },
  { surah: 55, ayah: 13 },
  { surah: 3, ayah: 139 },
] as const

export const HADITH_POOL = [
  { collection: 'bukhari', number: 1 },
  { collection: 'muslim', number: 45 },
  { collection: 'tirmidhi', number: 2516 },
] as const

export const ADHKAR_TAB_TO_CATEGORY: Record<
  Exclude<DailySpiritualTab, 'verse' | 'hadith'>,
  UmmahAdhkarCategory
> = {
  morning_adhkar: 'morning',
  evening_adhkar: 'evening',
  after_prayer: 'after_prayer',
}

const LANGUAGE_TO_QURAN_TRANSLATION: Record<string, UmmahQuranTranslationKey> = {
  en: 'sahih_international',
  ar: 'sahih_international',
  ur: 'urdu',
  id: 'indonesian',
  fr: 'french',
}

const LANGUAGE_TO_TAFSIR: Record<string, string> = {
  en: 'ibn_kathir',
  ar: 'ibn_kathir_ar',
  ur: 'ibn_kathir',
  id: 'ibn_kathir',
  fr: 'ibn_kathir',
}

export function daySeed(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000)
}

export function pickDailyIndex(seed: number, length: number): number {
  if (length <= 0) return 0
  return seed % length
}

export function getQuranTranslationKey(language: string): UmmahQuranTranslationKey {
  return LANGUAGE_TO_QURAN_TRANSLATION[language] ?? LANGUAGE_TO_QURAN_TRANSLATION.en
}

export function getTafsirKey(language: string): string {
  return LANGUAGE_TO_TAFSIR[language] ?? LANGUAGE_TO_TAFSIR.en
}

export function isArabicLanguage(language: string): boolean {
  return language === 'ar'
}
