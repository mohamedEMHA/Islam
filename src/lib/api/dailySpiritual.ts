import {
  ADHKAR_TAB_TO_CATEGORY,
  AYAH_POOL,
  daySeed,
  getQuranTranslationKey,
  HADITH_POOL,
  isArabicLanguage,
  pickDailyIndex,
  type DailySpiritualTab,
} from '@/lib/utils/dailySpiritual'
import {
  getUmmahDuasByCategory,
  getUmmahHadith,
  getUmmahQuranAyah,
  type DailyAdhkarFeed,
  type DailyHadithFeed,
  type DailySpiritualFeed,
  type DailyVerseFeed,
} from '@/lib/api/ummah'

export async function fetchDailyVerse(
  seed: number,
  language: string,
  signal?: AbortSignal,
): Promise<DailyVerseFeed> {
  const pick = AYAH_POOL[pickDailyIndex(seed, AYAH_POOL.length)]
  const translationKey = getQuranTranslationKey(language)
  const ayahData = await getUmmahQuranAyah(pick.surah, pick.ayah, signal)

  const translation =
    ayahData.verse.translations[translationKey] ??
    ayahData.verse.translations.sahih_international ??
    ''

  const text = isArabicLanguage(language) ? ayahData.verse.arabic : translation
  const reference = `${pick.surah}:${pick.ayah}`

  return {
    type: 'verse',
    arabic: ayahData.verse.arabic,
    transliteration: ayahData.verse.transliteration,
    text,
    reference,
    surah: pick.surah,
    ayah: pick.ayah,
  }
}

export async function fetchDailyHadith(
  seed: number,
  language: string,
  signal?: AbortSignal,
): Promise<DailyHadithFeed> {
  const pick = HADITH_POOL[pickDailyIndex(seed, HADITH_POOL.length)]
  const hadith = await getUmmahHadith(pick.collection, pick.number, signal)

  const text = isArabicLanguage(language) ? hadith.arabic : hadith.english
  const reference = `${hadith.collection_name} #${hadith.hadithnumber}`

  return {
    type: 'hadith',
    arabic: hadith.arabic,
    text,
    reference,
    grade: hadith.grade || undefined,
  }
}

export async function fetchDailyAdhkar(
  category: 'morning' | 'evening' | 'after_prayer',
  seed: number,
  language: string,
  signal?: AbortSignal,
): Promise<DailyAdhkarFeed> {
  const duas = await getUmmahDuasByCategory(category, signal)
  const dua = duas[pickDailyIndex(seed, duas.length)]

  if (!dua) {
    throw new Error(`No duas found for category: ${category}`)
  }

  const text = isArabicLanguage(language) ? dua.arabic : dua.translation

  return {
    type: 'adhkar',
    category,
    title: dua.title,
    arabic: dua.arabic,
    transliteration: dua.transliteration,
    text,
    reference: dua.source,
    repeat: dua.repeat > 1 ? dua.repeat : undefined,
  }
}

export async function fetchDailySpiritualTab(
  tab: DailySpiritualTab,
  language: string,
  signal?: AbortSignal,
  seed = daySeed(),
): Promise<DailySpiritualFeed> {
  if (tab === 'verse') {
    return fetchDailyVerse(seed, language, signal)
  }

  if (tab === 'hadith') {
    return fetchDailyHadith(seed, language, signal)
  }

  return fetchDailyAdhkar(ADHKAR_TAB_TO_CATEGORY[tab], seed, language, signal)
}
