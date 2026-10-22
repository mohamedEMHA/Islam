import { describe, expect, it } from 'vitest'
import {
  buildHadithReferences,
  extractNarratorFromEnglish,
  normalizeHadithGrade,
  parseApiHadith,
  parseHadithBook,
  parseIsnadFromArabicBody,
  stripHadithMarkup,
} from '@/lib/utils/sunnahParsers'
import { filterRadioStations, parseRadioStations } from '@/lib/api/mp3quran'
import { getSunnahRoute, hasSunnahHierarchy } from '@/lib/api/sunnah'

describe('sunnahParsers', () => {
  it('normalizes hadith grades', () => {
    expect(normalizeHadithGrade('Sahih')).toBe('sahih')
    expect(normalizeHadithGrade('Hasan')).toBe('hasan')
    expect(normalizeHadithGrade('Daif')).toBe('daif')
    expect(normalizeHadithGrade('صحيح')).toBe('sahih')
  })

  it('extracts narrator from english text', () => {
    const result = extractNarratorFromEnglish("Narrated Umar: Actions are by intentions.")
    expect(result.narrator).toBe('Umar')
    expect(result.english).toBe('Actions are by intentions.')
  })

  it('parses isnad narrator tags', () => {
    const body =
      '[narrator id="1" tooltip="Umar ibn al-Khattab"]Umar[/narrator] said...'
    expect(parseIsnadFromArabicBody(body)).toEqual([
      { narratorId: '1', name: 'Umar ibn al-Khattab' },
    ])
  })

  it('strips hadith markup tokens', () => {
    expect(stripHadithMarkup('[prematn]text[/prematn] [matn]matn[/matn]')).toBe('text matn')
    expect(stripHadithMarkup('<p>Hello</p><p>World</p>')).toBe('Hello\nWorld')
  })

  it('falls back to arabic chapter title when english is empty', async () => {
    const { getChapterDisplayTitle } = await import('@/lib/utils/sunnahParsers')
    expect(
      getChapterDisplayTitle({
        titleEn: '',
        titleAr: 'باب الوحي',
        chapterNumber: '2',
      }),
    ).toBe('باب الوحي')
  })

  it('ignores bare باب as a chapter title', async () => {
    const { getChapterDisplayTitle, hasMeaningfulChapterTitle } = await import(
      '@/lib/utils/sunnahParsers'
    )
    expect(
      getChapterDisplayTitle({
        titleEn: '',
        titleAr: 'باب',
        chapterNumber: '2',
      }),
    ).toBe('Chapter 2')
    expect(hasMeaningfulChapterTitle({ titleEn: '', titleAr: 'باب' })).toBe(false)
  })

  it('parses book and hadith api payloads', () => {
    const book = parseHadithBook({
      collection: 'bukhari',
      bookNumber: '1',
      name: { en: 'Revelation', ar: 'كتاب' },
      hadithStartNumber: 1,
      hadithEndNumber: 7,
      hadithCount: 7,
    })
    expect(book.nameEn).toBe('Revelation')

    const apiHadith = {
      collection: 'bukhari',
      bookNumber: '1',
      hadithNumber: '1',
      chapterId: '1.00',
      en: { urn: 10, text: "Narrated Umar: Test.", grades: [{ grade: 'Sahih' }] },
      ar: { urn: 100010, body: '[narrator id="1" tooltip="Umar"]Umar[/narrator]' },
    }
    const hadith = parseApiHadith(apiHadith, 'bukhari', 'islamic.app')

    expect(hadith.id).toBe('1')
    expect(hadith.references?.urn).toBe(10)
    expect(buildHadithReferences(apiHadith, 'bukhari').uscMsa).toContain('bukhari:1')
  })

  it('preserves compound and lettered hadith ids', () => {
    const muslim = parseApiHadith(
      {
        collection: 'muslim',
        bookNumber: '1',
        hadithNumber: '8 a',
        chapterId: '1.00',
        en: { text: 'Narrated Abu Huraira: Test.' },
      },
      'muslim',
      'islamic.app',
    )
    expect(muslim.id).toBe('8 a')

    const bukhari = parseApiHadith(
      {
        collection: 'bukhari',
        bookNumber: '56',
        hadithNumber: '2788, 2789',
        chapterId: '2.00',
        en: { text: 'Narrated Someone: Compound.' },
      },
      'bukhari',
      'islamic.app',
    )
    expect(bukhari.id).toBe('2788, 2789')
  })

  it('enriches untitled chapters from first hadith preview', async () => {
    const { enrichChaptersFromHadiths } = await import('@/lib/utils/sunnahParsers')
    const chapters = [
      {
        collection: 'bukhari',
        bookNumber: '1',
        chapterId: '2.00',
        chapterNumber: '2',
        titleEn: '',
        titleAr: 'باب',
      },
    ]
    const hadiths = [
      {
        collection: 'bukhari',
        id: '2',
        arabic: '',
        english: 'While I was walking I heard a voice from the sky.',
        grade: 'sahih' as const,
        narrator: "Aisha",
        chapterId: '2.00',
      },
    ]
    const enriched = enrichChaptersFromHadiths(chapters, hadiths)
    expect(enriched[0]?.titleEn).toBe('Narrated Aisha')
  })

  it('builds reader paths with encoded ids', async () => {
    const { buildHadithReaderPath, isNumericHadithId } = await import('@/lib/utils/sunnahParsers')
    expect(isNumericHadithId('8')).toBe(true)
    expect(isNumericHadithId('8 a')).toBe(false)
    expect(buildHadithReaderPath('muslim', '8 a', { book: '1' })).toBe(
      '/hadith/muslim/8%20a?book=1',
    )
    expect(buildHadithReaderPath('bukhari', '2788, 2789', { book: '56', chapter: '2.00' })).toBe(
      '/hadith/bukhari/2788%2C%202789?book=56&chapter=2.00',
    )
  })
})

describe('sunnah routes', () => {
  it('maps internal collection ids to sunnah slugs', () => {
    expect(getSunnahRoute('nawawi')?.sunnahSlug).toBe('nawawi40')
    expect(getSunnahRoute('dehlawi')?.fortyBookNumber).toBe('3')
    expect(hasSunnahHierarchy('bukhari')).toBe(true)
  })

  it('builds forty book paths without nested /books/n/books', async () => {
    const { buildBooksListPaths, buildBookResourcePaths } = await import('@/lib/api/sunnah')
    const route = getSunnahRoute('nawawi')!
    expect(buildBooksListPaths(route).islamicPath).toBe('/collections/forty/books')
    expect(buildBookResourcePaths(route, '1', '/hadiths').islamicPath).toBe(
      '/collections/forty/books/1/hadiths',
    )
    expect(buildBookResourcePaths(route, '99', '/chapters').islamicPath).toBe(
      '/collections/forty/books/1/chapters',
    )
  })
})

describe('mp3quran parsers', () => {
  it('parses and filters radio stations', () => {
    const stations = parseRadioStations({
      radios: [
        { id: 1, name: 'Radio Ahmad Al-Ajmy', url: 'https://example.com/a' },
        { id: 2, name: 'Holy Quran from Saudia Arabia', url: 'https://example.com/b' },
        {
          id: 109084,
          name: 'Noreen Mohammed Siddiq',
          url: 'https://backup.qurango.net/radio/nourin_siddig',
        },
      ],
    })
    expect(stations.map((s) => s.name)).toEqual([
      'Ahmad Al-Ajmy',
      'Holy Quran from Saudia Arabia',
    ])
    expect(filterRadioStations(stations, 'ahmad')).toHaveLength(1)
    expect(filterRadioStations(stations, 'missing')).toHaveLength(0)
  })

  it('detects Qurango hosts for dead-stream probing', async () => {
    const { isQurangoRadioUrl, isKnownDeadRadioUrl } = await import('@/lib/api/mp3quran')
    expect(isQurangoRadioUrl('https://backup.qurango.net/radio/maher')).toBe(true)
    expect(isQurangoRadioUrl('https://stream.radiojar.com/0tpy1h0kxtzuv')).toBe(false)
    expect(isKnownDeadRadioUrl('https://backup.qurango.net/radio/nourin_siddig')).toBe(true)
    expect(isKnownDeadRadioUrl('https://backup.qurango.net/radio/maher')).toBe(false)
  })

  it('drops known-dead Qurango stations without relying on CORS HEAD', async () => {
    const { filterDeadQurangoStations } = await import('@/lib/api/mp3quran')
    const kept = await filterDeadQurangoStations(
      [
        { id: 1, name: 'Maher', url: 'https://backup.qurango.net/radio/maher' },
        { id: 2, name: 'Noreen', url: 'https://backup.qurango.net/radio/nourin_siddig' },
        { id: 3, name: 'Saudi', url: 'https://stream.radiojar.com/0tpy1h0kxtzuv' },
      ],
      { timeoutMs: 20 },
    )
    expect(kept.map((s) => s.id)).toEqual([1, 3])
  })
})

describe('radio url candidates', () => {
  it('adds Qurango mirrors for backup stream urls', async () => {
    const { buildRadioUrlCandidates } = await import('@/lib/hooks/useRadioPlayer')
    const candidates = buildRadioUrlCandidates('https://backup.qurango.net/radio/maher')
    expect(candidates[0]).toBe('https://backup.qurango.net/radio/maher')
    expect(candidates).toContain('https://Qurango.net/radio/maher')
    expect(candidates).toContain('https://qurango.net/radio/maher')
  })
})
