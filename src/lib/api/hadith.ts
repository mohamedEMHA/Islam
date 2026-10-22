import { apiFetch } from './client'
import { getSunnahHadith, hasSunnahHierarchy } from './sunnah'
import type { HadithCollection, HadithEntry } from '@/types/hadith'
import { isNumericHadithId, normalizeHadithGrade } from '@/lib/utils/sunnahParsers'

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1'

export const HADITH_COLLECTIONS: HadithCollection[] = [
  { id: 'bukhari', name: 'Sahih al-Bukhari', description: 'The most authentic collection', count: 7563, sunnahSlug: 'bukhari' },
  { id: 'muslim', name: 'Sahih Muslim', description: 'Second most authentic collection', count: 7470, sunnahSlug: 'muslim' },
  { id: 'abudawud', name: 'Sunan Abu Dawud', description: 'Focus on legal hadith', count: 5274, sunnahSlug: 'abudawud' },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi', description: 'With grading commentary', count: 3956, sunnahSlug: 'tirmidhi' },
  { id: 'nasai', name: "Sunan an-Nasa'i", description: 'Rigorous authentication', count: 5761, sunnahSlug: 'nasai' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', description: 'One of the six major books', count: 4341, sunnahSlug: 'ibnmajah' },
  { id: 'malik', name: 'Muwatta Malik', description: 'Earliest written collection', count: 1973, sunnahSlug: 'malik' },
  { id: 'nawawi', name: 'Forty Hadith of an-Nawawi', description: 'Essential principles of faith', count: 42, sunnahSlug: 'nawawi40', fortyBookNumber: '1' },
  { id: 'qudsi', name: 'Forty Hadith Qudsi', description: 'Sacred hadith from Allah', count: 40, sunnahSlug: 'qudsi40', fortyBookNumber: '2' },
  { id: 'dehlawi', name: 'Forty Hadith of Shah Waliullah Dehlawi', description: 'Selected foundational hadith', count: 40, sunnahSlug: 'forty', fortyBookNumber: '3' },
]

export function getHadithCollectionName(id: string): string {
  return HADITH_COLLECTIONS.find((c) => c.id === id)?.name ?? id
}

export function isHadithCollection(id: string | undefined): id is string {
  return !!id && HADITH_COLLECTIONS.some((c) => c.id === id)
}

function extractNarrator(text: string): { narrator?: string; english: string } {
  const match = text.match(/^Narrated\s+([^:]+):\s*([\s\S]*)$/i)
  if (!match) return { english: text }
  return { narrator: match[1].trim(), english: match[2].trim() }
}

interface HadithSectionDetail {
  hadithnumber_first: number
  hadithnumber_last: number
}

interface HadithMetadata {
  name: string
  section?: Record<string, string>
  section_detail?: Record<string, HadithSectionDetail>
}

interface FawazHadith {
  hadithnumber: number
  arabicnumber?: number
  text: string
  grades?: Array<{ graded_by: string; grade: string }>
  reference?: { book: number; hadith: number }
}

interface CollectionJson {
  hadiths: FawazHadith[]
}

const collectionJsonCache = new Map<string, CollectionJson>()

async function getCollectionJson(collection: string, signal?: AbortSignal): Promise<CollectionJson> {
  const cached = collectionJsonCache.get(collection)
  if (cached) return cached

  const data = await apiFetch<CollectionJson>(`${CDN}/editions/eng-${collection}.min.json`, {
    source: 'fawazahmed0/hadith-api',
    signal,
  })
  collectionJsonCache.set(collection, data)
  return data
}

function findHadithMatches(hadiths: FawazHadith[], query: string, limit: number): FawazHadith[] {
  const q = query.toLowerCase()
  const matches: FawazHadith[] = []

  for (const hadith of hadiths) {
    if (hadith.text.toLowerCase().includes(q)) {
      matches.push(hadith)
      if (matches.length >= limit) break
    }
  }

  return matches
}

function resolveChapter(metadata: HadithMetadata, hadithNumber: number): string | undefined {
  const details = metadata.section_detail
  const sections = metadata.section
  if (!details || !sections) return undefined

  for (const [sectionId, detail] of Object.entries(details)) {
    if (hadithNumber >= detail.hadithnumber_first && hadithNumber <= detail.hadithnumber_last) {
      const label = sections[sectionId]
      return label?.trim() || undefined
    }
  }

  return undefined
}

function mergeHadithEntries(base: HadithEntry, enriched: HadithEntry): HadithEntry {
  return {
    ...base,
    id: enriched.id || base.id,
    arabic: enriched.arabic || base.arabic,
    english: enriched.english || base.english,
    grade: enriched.grade !== 'unknown' ? enriched.grade : base.grade,
    narrator: enriched.narrator || base.narrator,
    book: enriched.book || base.book,
    bookNumber: enriched.bookNumber || base.bookNumber,
    chapter: enriched.chapter || base.chapter,
    chapterId: enriched.chapterId || base.chapterId,
    chapterIntro: enriched.chapterIntro || base.chapterIntro,
    references: enriched.references || base.references,
    isnad: enriched.isnad?.length ? enriched.isnad : base.isnad,
    source: enriched.source || base.source,
  }
}

function decodeHadithId(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

export async function getHadith(
  collection: string,
  id: string,
  bookNumber?: string,
  signal?: AbortSignal,
): Promise<HadithEntry> {
  const hadithId = decodeHadithId(id)
  if (!hadithId) throw new Error('Hadith not found')

  const routeBook = HADITH_COLLECTIONS.find((c) => c.id === collection)?.fortyBookNumber
  let resolvedBook = routeBook ?? bookNumber

  if (hasSunnahHierarchy(collection) && resolvedBook) {
    const sunnahHadith = await getSunnahHadith(collection, hadithId, resolvedBook)
    if (sunnahHadith?.english) {
      return sunnahHadith
    }
  }

  // Fawaz CDN only supports contiguous integer ids.
  if (!isNumericHadithId(hadithId)) {
    throw new Error('Hadith not found')
  }

  const numericId = Number.parseInt(hadithId, 10)

  const data = await apiFetch<{
    metadata: HadithMetadata
    hadiths: FawazHadith[]
  }>(`${CDN}/editions/eng-${collection}/${numericId}.json`, {
    source: 'fawazahmed0/hadith-api',
    signal,
  })

  const hadith = data.hadiths[0]
  if (!hadith) throw new Error('Hadith not found')

  const arabicData = await apiFetch<{
    hadiths: Array<{ text: string }>
  }>(`${CDN}/editions/ara-${collection}/${numericId}.json`, {
    source: 'fawazahmed0/hadith-api',
    signal,
  }).catch(() => ({ hadiths: [{ text: '' }] }))

  const { narrator, english } = extractNarrator(hadith.text)
  const fawazBook = hadith.reference?.book ? String(hadith.reference.book) : undefined
  resolvedBook = resolvedBook ?? fawazBook

  const base: HadithEntry = {
    collection,
    id: String(hadith.hadithnumber),
    arabic: arabicData.hadiths[0]?.text ?? '',
    english,
    grade: normalizeHadithGrade(hadith.grades?.[0]?.grade),
    narrator,
    book: hadith.reference ? `Book ${hadith.reference.book}` : undefined,
    bookNumber: resolvedBook,
    chapter: resolveChapter(data.metadata, hadith.hadithnumber),
    source: 'fawazahmed0',
  }

  if (hasSunnahHierarchy(collection) && resolvedBook) {
    const enriched = await getSunnahHadith(collection, hadithId, resolvedBook)
    if (enriched) return mergeHadithEntries(base, enriched)
  }

  return base
}

export async function searchHadith(
  collection: string,
  query: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<HadithEntry[]> {
  const data = await getCollectionJson(collection, signal)

  const matches = findHadithMatches(data.hadiths, query, limit)

  return matches.map((h) => ({
    collection,
    id: String(h.hadithnumber),
    arabic: '',
    english: h.text,
    grade: normalizeHadithGrade(h.grades?.[0]?.grade),
    bookNumber: h.reference?.book ? String(h.reference.book) : undefined,
  }))
}

const SEARCH_COLLECTION_ORDER = HADITH_COLLECTIONS.map((c) => c.id)

export async function searchHadithAll(
  query: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<HadithEntry[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const results: HadithEntry[] = []
  const seen = new Set<string>()

  for (const collection of SEARCH_COLLECTION_ORDER) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    if (results.length >= limit) break
    const remaining = limit - results.length
    const batch = await searchHadith(collection, trimmed, remaining, signal).catch((err) => {
      if (err instanceof DOMException && err.name === 'AbortError') throw err
      return [] as HadithEntry[]
    })
    for (const entry of batch) {
      const key = `${entry.collection}:${entry.id}`
      if (seen.has(key)) continue
      seen.add(key)
      results.push(entry)
      if (results.length >= limit) break
    }
  }

  return results
}

export { hasSunnahHierarchy } from './sunnah'
export {
  getCollectionBooks,
  getCollectionBook,
  getBookChapters,
  getBookHadiths,
  getHadithProviderLabel,
} from './sunnah'
