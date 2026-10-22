import {
  getStaticCopyForPath,
  getStaticPageCopy,
  NOINDEX_PATHS,
  type PageSeoCopy,
} from './copy.ts'
import { getHadithCollectionMeta, isHadithCollectionId, isSafeHadithSeoId } from './hadith.ts'
import {
  absoluteUrl,
  getLanguageDirection,
  hreflangAlternates,
  localizedPath,
  parseLocalePath,
  SITE_URL,
  type LocaleCode,
  type HreflangAlternate,
} from './locale.ts'
import { getSurah, type SurahMeta } from './surahs.ts'

export type SeoKind =
  | 'static'
  | 'surah'
  | 'tafsir_surah'
  | 'hadith_collection'
  | 'hadith_books'
  | 'hadith_book'
  | 'hadith_entry'
  | 'not_found'

export interface SeoBreadcrumb {
  name: string
  path: string
}

export interface ResolvedSeo {
  kind: SeoKind
  locale: LocaleCode
  /** Path without locale prefix */
  pathWithoutLocale: string
  /** Full path including locale prefix */
  canonicalPath: string
  canonicalUrl: string
  title: string
  description: string
  h1: string
  body: string
  noIndex: boolean
  status: 200 | 404
  dir: 'rtl' | 'ltr'
  alternates: HreflangAlternate[]
  breadcrumbs: SeoBreadcrumb[]
  surah?: SurahMeta
  hadithCollectionId?: string
  hadithId?: string
  bookNumber?: string
  /** Extra ayah / hadith text injected after fetch */
  richText?: string
}

function titleWithBrand(title: string): string {
  return title.includes('Islam') ? title : `${title} | Islam`
}

function surahCopy(surah: SurahMeta, locale: LocaleCode, mode: 'quran' | 'tafsir'): PageSeoCopy {
  const isTafsir = mode === 'tafsir'
  if (locale === 'ar') {
    return {
      title: isTafsir
        ? `تفسير سورة ${surah.nameArabic}`
        : `سورة ${surah.nameArabic} · ${surah.nameLatin}`,
      description: isTafsir
        ? `تفسير سورة ${surah.nameArabic} (${surah.nameLatin})، ${surah.ayahs} آيات، ${surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'}.`
        : `سورة ${surah.nameArabic} (${surah.translationEn})، ${surah.ayahs} آيات، ${surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'}. اقرأ النص العربي والترجمة.`,
      h1: isTafsir ? `تفسير سورة ${surah.nameArabic}` : `سورة ${surah.nameArabic}`,
      body: `${surah.nameLatin} · ${surah.translationEn} · ${surah.ayahs} آيات`,
    }
  }
  const prefix = isTafsir ? 'Tafsir of ' : 'Surah '
  return {
    title: `${prefix}${surah.nameLatin} (${surah.nameArabic})`,
    description: `${prefix}${surah.nameLatin}, ${surah.translationEn}. ${surah.ayahs} ayahs, ${surah.revelation}. Read Arabic text and translation on Islam.`,
    h1: `${prefix}${surah.nameLatin}`,
    body: `${surah.nameArabic} · ${surah.translationEn} · ${surah.ayahs} verses · ${surah.revelation}`,
  }
}

function hadithCollectionCopy(id: string, locale: LocaleCode): PageSeoCopy {
  const meta = getHadithCollectionMeta(id)
  const name = meta?.name ?? id
  const desc = meta?.description ?? 'Authenticated hadith collection'
  if (locale === 'ar') {
    return {
      title: name,
      description: `${desc}. اقرأ الأحاديث على Islam.`,
      h1: name,
      body: desc,
    }
  }
  return {
    title: name,
    description: `${desc}. Browse graded hadith on Islam.`,
    h1: name,
    body: desc,
  }
}

function resolveDynamic(pathWithoutLocale: string, locale: LocaleCode): ResolvedSeo | null {
  const segments = pathWithoutLocale.split('/').filter(Boolean)

  if (segments[0] === 'quran' && segments.length === 2) {
    const num = Number(segments[1])
    const surah = getSurah(num)
    if (!surah) return null
    const copy = surahCopy(surah, locale, 'quran')
    const path = `/quran/${surah.number}`
    return baseResolved('surah', locale, path, copy, {
      surah,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Quran', path: '/quran' },
        { name: surah.nameLatin, path },
      ],
    })
  }

  if (segments[0] === 'tafsir' && segments.length === 2) {
    const num = Number(segments[1])
    const surah = getSurah(num)
    if (!surah) return null
    const copy = surahCopy(surah, locale, 'tafsir')
    const path = `/tafsir/${surah.number}`
    return baseResolved('tafsir_surah', locale, path, copy, {
      surah,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Tafsir', path: '/tafsir' },
        { name: surah.nameLatin, path },
      ],
    })
  }

  if (segments[0] === 'hadith' && segments.length === 2 && isHadithCollectionId(segments[1])) {
    const id = segments[1]
    const copy = hadithCollectionCopy(id, locale)
    const path = `/hadith/${id}`
    return baseResolved('hadith_collection', locale, path, copy, {
      hadithCollectionId: id,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Hadith', path: '/hadith' },
        { name: copy.h1, path },
      ],
    })
  }

  if (
    segments[0] === 'hadith' &&
    segments.length === 3 &&
    isHadithCollectionId(segments[1]) &&
    segments[2] === 'books'
  ) {
    const id = segments[1]
    const meta = getHadithCollectionMeta(id)
    const name = meta?.name ?? id
    const copy: PageSeoCopy = {
      title: `${name} Books`,
      description: `Browse books in ${name}.`,
      h1: `${name} Books`,
      body: `Book list for ${name}.`,
    }
    const path = `/hadith/${id}/books`
    return baseResolved('hadith_books', locale, path, copy, {
      hadithCollectionId: id,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Hadith', path: '/hadith' },
        { name: name, path: `/hadith/${id}` },
        { name: 'Books', path },
      ],
    })
  }

  if (
    segments[0] === 'hadith' &&
    segments.length === 4 &&
    isHadithCollectionId(segments[1]) &&
    segments[2] === 'books'
  ) {
    const id = segments[1]
    const bookNumber = segments[3]
    const meta = getHadithCollectionMeta(id)
    const name = meta?.name ?? id
    const copy: PageSeoCopy = {
      title: `${name}, Book ${bookNumber}`,
      description: `Hadith from ${name}, book ${bookNumber}.`,
      h1: `${name}, Book ${bookNumber}`,
      body: `Browse hadith in book ${bookNumber} of ${name}.`,
    }
    const path = `/hadith/${id}/books/${bookNumber}`
    return baseResolved('hadith_book', locale, path, copy, {
      hadithCollectionId: id,
      bookNumber,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Hadith', path: '/hadith' },
        { name: name, path: `/hadith/${id}` },
        { name: 'Books', path: `/hadith/${id}/books` },
        { name: `Book ${bookNumber}`, path },
      ],
    })
  }

  if (segments[0] === 'hadith' && segments.length === 3 && isHadithCollectionId(segments[1])) {
    const id = segments[1]
    const hadithId = segments[2]
    if (hadithId === 'books') return null
    if (!isSafeHadithSeoId(hadithId)) return null
    const meta = getHadithCollectionMeta(id)
    const name = meta?.name ?? id
    const copy: PageSeoCopy = {
      title: `Hadith ${hadithId}, ${name}`,
      description: `Read hadith ${hadithId} from ${name} with Arabic and translation.`,
      h1: `${name}, Hadith ${hadithId}`,
      body: `Authenticated hadith from ${name}.`,
    }
    const path = `/hadith/${id}/${hadithId}`
    return baseResolved('hadith_entry', locale, path, copy, {
      hadithCollectionId: id,
      hadithId,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Hadith', path: '/hadith' },
        { name: name, path: `/hadith/${id}` },
        { name: `Hadith ${hadithId}`, path },
      ],
    })
  }

  return null
}

function baseResolved(
  kind: SeoKind,
  locale: LocaleCode,
  pathWithoutLocale: string,
  copy: PageSeoCopy,
  extra: Partial<ResolvedSeo> = {},
): ResolvedSeo {
  const canonicalPath = localizedPath(pathWithoutLocale, locale)
  const noIndex = NOINDEX_PATHS.has(pathWithoutLocale)
  return {
    kind,
    locale,
    pathWithoutLocale,
    canonicalPath,
    canonicalUrl: absoluteUrl(canonicalPath),
    title: titleWithBrand(copy.title),
    description: copy.description,
    h1: copy.h1,
    body: copy.body,
    noIndex,
    status: 200,
    dir: getLanguageDirection(locale),
    alternates: hreflangAlternates(pathWithoutLocale),
    breadcrumbs: extra.breadcrumbs ?? [
      { name: 'Home', path: '/' },
      { name: copy.h1, path: pathWithoutLocale },
    ],
    ...extra,
  }
}

export function resolveSeo(pathname: string): ResolvedSeo {
  const { locale, pathWithoutLocale } = parseLocalePath(pathname)

  // Reject unknown locale-looking first segments that aren't real prefixes handled above
  // (parseLocalePath already only strips known prefixes)

  if (pathWithoutLocale === '/onboarding') {
    const copy = getStaticPageCopy('welcome', locale)
    return baseResolved('static', locale, '/welcome', copy, { noIndex: true })
  }

  const staticCopy = getStaticCopyForPath(pathWithoutLocale, locale)
  if (staticCopy) {
    return baseResolved('static', locale, pathWithoutLocale, staticCopy)
  }

  const dynamic = resolveDynamic(pathWithoutLocale, locale)
  if (dynamic) return dynamic

  const notFound = getStaticPageCopy('not_found', locale)
  const canonicalPath = localizedPath(pathWithoutLocale, locale)
  return {
    kind: 'not_found',
    locale,
    pathWithoutLocale,
    canonicalPath,
    canonicalUrl: absoluteUrl(canonicalPath),
    title: titleWithBrand(notFound.title),
    description: notFound.description,
    h1: notFound.h1,
    body: notFound.body,
    noIndex: true,
    status: 404,
    dir: getLanguageDirection(locale),
    alternates: hreflangAlternates('/'),
    breadcrumbs: [{ name: 'Home', path: '/' }],
  }
}

export function isHtmlNavigation(request: Request): boolean {
  const accept = request.headers.get('Accept') ?? ''
  if (accept.includes('text/html')) return true
  const url = new URL(request.url)
  const path = url.pathname
  if (path.includes('.')) {
    // Allow extensionless and known HTML; skip static assets
    const ext = path.split('.').pop()?.toLowerCase()
    if (ext && ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'woff', 'woff2', 'map', 'json', 'xml', 'txt', 'webmanifest', 'mp3'].includes(ext)) {
      return false
    }
  }
  return request.method === 'GET' || request.method === 'HEAD'
}

export { SITE_URL }
