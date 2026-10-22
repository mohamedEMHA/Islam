import type {
  HadithBook,
  HadithChapter,
  HadithEntry,
  HadithGrade,
  HadithIsnadSegment,
  HadithReference,
} from '@/types/hadith'

export function normalizeHadithGrade(grade?: string | null): HadithGrade {
  if (!grade) return 'unknown'
  const g = grade.toLowerCase()
  if (g.includes('sahih') || g.includes('authentic') || g.includes('صحيح')) return 'sahih'
  if (g.includes('hasan') || g.includes('good') || g.includes('حسن')) return 'hasan'
  if (g.includes('daif') || g.includes('weak') || g.includes('ضعيف')) return 'daif'
  return 'unknown'
}

export function stripHadithMarkup(text: string): string {
  return text
    .replace(/\[(?:prematn|matn|\/prematn|\/matn)\]/gi, '')
    .replace(/\[narrator[^\]]*\]/gi, '')
    .replace(/\[\/narrator\]/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isGenericBabTitle(title?: string | null): boolean {
  if (!title) return true
  const normalized = title.trim()
  if (!normalized) return true
  // API often returns bare "باب" with no real chapter name.
  return normalized === 'باب' || normalized === 'باب.' || /^الباب\s*$/.test(normalized)
}

export function getChapterDisplayTitle(
  chapter: Pick<HadithChapter, 'titleEn' | 'titleAr' | 'chapterNumber'>,
): string {
  const en = chapter.titleEn?.trim()
  if (en && !isGenericBabTitle(en)) return en
  const ar = chapter.titleAr?.trim()
  if (ar && !isGenericBabTitle(ar)) return ar
  return `Chapter ${chapter.chapterNumber}`
}

export function hasMeaningfulChapterTitle(
  chapter: Pick<HadithChapter, 'titleEn' | 'titleAr'>,
): boolean {
  const en = chapter.titleEn?.trim()
  const ar = chapter.titleAr?.trim()
  return Boolean((en && !isGenericBabTitle(en)) || (ar && !isGenericBabTitle(ar)))
}

function normalizeChapterIdKey(value: string | null | undefined): string {
  if (!value) return ''
  return value.trim().replace(/\.0+$/, '')
}

function hadithPreviewLabel(hadith: HadithEntry, maxLen = 90): string {
  if (hadith.narrator?.trim()) {
    return `Narrated ${hadith.narrator.trim()}`
  }
  const text = hadith.english.replace(/\s+/g, ' ').trim()
  if (!text) return ''
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen - 1).trimEnd()}…`
}

/**
 * islamic.app / sunnah often return empty EN + bare "باب" for untitled chapters.
 * Fill those from the first hadith in each chapter so the picker is usable.
 */
export function enrichChaptersFromHadiths(
  chapters: HadithChapter[],
  hadiths: HadithEntry[],
): HadithChapter[] {
  if (chapters.length === 0 || hadiths.length === 0) return chapters

  const firstById = new Map<string, HadithEntry>()
  for (const hadith of hadiths) {
    const id = hadith.chapterId?.trim()
    if (!id || id === '0.00') continue
    if (!firstById.has(id)) firstById.set(id, hadith)
    const key = normalizeChapterIdKey(id)
    if (key && !firstById.has(key)) firstById.set(key, hadith)
  }

  return chapters.map((chapter) => {
    if (hasMeaningfulChapterTitle(chapter)) return chapter

    const first =
      firstById.get(chapter.chapterId) ??
      firstById.get(normalizeChapterIdKey(chapter.chapterId)) ??
      firstById.get(chapter.chapterNumber) ??
      firstById.get(normalizeChapterIdKey(chapter.chapterNumber))

    if (!first) return chapter

    // Prefer a real chapter label from the hadith payload when present.
    const fromHadithEn = first.chapter?.trim()
    if (fromHadithEn && !isGenericBabTitle(fromHadithEn) && !/^chapter\s+\d+/i.test(fromHadithEn)) {
      return { ...chapter, titleEn: fromHadithEn }
    }

    const preview = hadithPreviewLabel(first)
    if (!preview) return chapter
    return { ...chapter, titleEn: preview }
  })
}

export function parseIsnadFromArabicBody(body: string): HadithIsnadSegment[] {
  const segments: HadithIsnadSegment[] = []
  const regex = /\[narrator id="([^"]*)"(?: tooltip="([^"]*)")?\]([^[]+)\[\/narrator\]/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(body)) !== null) {
    const [, narratorId, tooltip, rawName] = match
    const name = (tooltip || rawName).trim()
    if (name) {
      segments.push({
        narratorId: narratorId || undefined,
        name,
      })
    }
  }

  return segments
}

export function extractNarratorFromEnglish(text: string): { narrator?: string; english: string } {
  const match = text.match(/^Narrated\s+([^:]+):\s*([\s\S]*)$/i)
  if (!match) return { english: text.trim() }
  return { narrator: match[1].trim(), english: match[2].trim() }
}

interface LocalizedText {
  en?: string | null
  ar?: string | null
}

interface ApiBook {
  collection: string
  bookNumber: string
  name?: LocalizedText
  intro?: LocalizedText
  hadithStartNumber: number
  hadithEndNumber: number
  hadithCount: number
}

interface ApiChapter {
  collection: string
  bookNumber: string
  chapterId: string
  chapterNumber: string
  title?: LocalizedText
  intro?: LocalizedText
}

interface ApiHadithGrade {
  graded_by?: string | null
  grade?: string | null
}

interface ApiHadithLang {
  urn?: number
  body?: string
  text?: string
  grades?: ApiHadithGrade[]
}

interface ApiHadith {
  collection: string
  bookNumber: string
  hadithNumber: string
  chapterId?: string
  chapterNumber?: string
  chapterTitle?: LocalizedText
  intro?: LocalizedText
  en?: ApiHadithLang
  ar?: ApiHadithLang
}

export function parseHadithBook(book: ApiBook): HadithBook {
  return {
    collection: book.collection,
    bookNumber: book.bookNumber,
    nameEn: book.name?.en?.trim() || `Book ${book.bookNumber}`,
    nameAr: book.name?.ar?.trim() || undefined,
    introEn: book.intro?.en?.trim() || undefined,
    introAr: book.intro?.ar?.trim() || undefined,
    hadithStartNumber: book.hadithStartNumber,
    hadithEndNumber: book.hadithEndNumber,
    hadithCount: book.hadithCount,
  }
}

export function parseHadithChapter(chapter: ApiChapter): HadithChapter {
  return {
    collection: chapter.collection,
    bookNumber: chapter.bookNumber,
    chapterId: chapter.chapterId,
    chapterNumber: chapter.chapterNumber,
    titleEn: chapter.title?.en?.trim() || undefined,
    titleAr: chapter.title?.ar?.trim() || undefined,
    introEn: chapter.intro?.en?.trim() || undefined,
    introAr: chapter.intro?.ar?.trim() || undefined,
  }
}

export function buildHadithReferences(
  hadith: ApiHadith,
  collectionId: string,
): HadithReference {
  const hadithNum = hadith.hadithNumber
  const bookNum = hadith.bookNumber
  const sunnahSlug =
    collectionId === 'nawawi'
      ? 'nawawi40'
      : collectionId === 'qudsi'
        ? 'qudsi40'
        : collectionId === 'dehlawi'
          ? 'forty'
          : collectionId

  return {
    bookNumber: bookNum,
    hadithNumber: hadithNum,
    uscMsa: `https://sunnah.com/${sunnahSlug}:${hadithNum}`,
    arabicRef: hadith.ar?.urn ? `URN ${hadith.ar.urn}` : undefined,
    urn: hadith.en?.urn,
    urnArabic: hadith.ar?.urn,
  }
}

export function isNumericHadithId(id: string): boolean {
  return /^\d+$/.test(id.trim())
}

export function buildHadithReaderPath(
  collection: string,
  id: string,
  query?: { book?: string; chapter?: string },
): string {
  const params = new URLSearchParams()
  if (query?.book) params.set('book', query.book)
  if (query?.chapter) params.set('chapter', query.chapter)
  const qs = params.toString()
  return `/hadith/${collection}/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`
}

export function parseApiHadith(
  hadith: ApiHadith,
  collectionId: string,
  source: 'sunnah.com' | 'islamic.app',
): HadithEntry {
  const englishRaw = hadith.en?.text?.trim() || stripHadithMarkup(hadith.en?.body || '')
  const { narrator, english } = extractNarratorFromEnglish(englishRaw)
  const arabicBody = hadith.ar?.body || ''
  const arabic = hadith.ar?.text?.trim() || stripHadithMarkup(arabicBody)
  const id = String(hadith.hadithNumber ?? '').trim()

  return {
    collection: collectionId,
    id,
    arabic,
    english,
    grade: normalizeHadithGrade(hadith.en?.grades?.[0]?.grade),
    narrator,
    book: `Book ${hadith.bookNumber}`,
    bookNumber: hadith.bookNumber,
    chapter: hadith.chapterTitle?.en?.trim() || hadith.chapterTitle?.ar?.trim() || undefined,
    chapterId: hadith.chapterId,
    chapterIntro: hadith.intro?.en?.trim() || hadith.intro?.ar?.trim() || undefined,
    references: buildHadithReferences(hadith, collectionId),
    isnad: arabicBody ? parseIsnadFromArabicBody(arabicBody) : undefined,
    source,
  }
}

export function dedupeBooks(books: HadithBook[]): HadithBook[] {
  const seen = new Set<string>()
  return books.filter((book) => {
    const key = book.bookNumber
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
