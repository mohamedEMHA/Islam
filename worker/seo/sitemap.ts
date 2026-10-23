import { INDEXABLE_STATIC_PATHS } from '../../shared/seo/copy.ts'
import { SEO_CITIES } from '../../shared/seo/cities.ts'
import { HADITH_COLLECTIONS_SEO } from '../../shared/seo/hadith.ts'
import {
  ALL_LOCALES,
  SITE_URL,
  hreflangAlternates,
  localizedPath,
  type LocaleCode,
} from '../../shared/seo/locale.ts'
import { DUA_CATEGORY_IDS } from '../../shared/seo/resolve.ts'
import { SURAHS } from '../../shared/seo/surahs.ts'

/** Stable lastmod for static content (bump when SEO copy changes). */
export const SITEMAP_LASTMOD = '2026-10-22'

/** Hadith entry id ranges included in sitemaps (keeps file size bounded). */
const HADITH_ENTRY_RANGE: Record<string, number> = {
  bukhari: 100,
  muslim: 100,
  abudawud: 80,
  tirmidhi: 80,
  nasai: 80,
  ibnmajah: 80,
  malik: 80,
  nawawi: 42,
  qudsi: 40,
  dehlawi: 40,
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function urlEntry(
  pathWithoutLocale: string,
  locale: LocaleCode,
  changefreq: string,
  priority: string,
  lastmod: string = SITEMAP_LASTMOD,
): string {
  const loc = `${SITE_URL}${localizedPath(pathWithoutLocale, locale)}`
  const links = hreflangAlternates(pathWithoutLocale)
    .map(
      (alt) =>
        `    <xhtml:link rel="alternate" hreflang="${xmlEscape(alt.hreflang)}" href="${xmlEscape(alt.href)}" />`,
    )
    .join('\n')
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    links,
    '  </url>',
  ].join('\n')
}

function urlset(entries: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
  ].join('\n')
}

export function sitemapIndexXml(includeCities = false): string {
  const files = [
    'sitemap_pages.xml',
    'sitemap_quran.xml',
    'sitemap_tafsir.xml',
    'sitemap_hadith.xml',
    'sitemap_hadith_entries.xml',
    'sitemap_duas.xml',
  ]
  if (includeCities) {
    files.push('sitemap_cities.xml')
  }
  const body = files
    .map(
      (file) =>
        `  <sitemap>\n    <loc>${SITE_URL}/${file}</loc>\n    <lastmod>${SITEMAP_LASTMOD}</lastmod>\n  </sitemap>`,
    )
    .join('\n')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</sitemapindex>',
  ].join('\n')
}

export function sitemapPagesXml(): string {
  const paths = ['/', ...INDEXABLE_STATIC_PATHS]
  const entries: string[] = []
  for (const path of paths) {
    for (const locale of ALL_LOCALES) {
      const priority = path === '/' ? '1.0' : '0.7'
      entries.push(urlEntry(path, locale, 'weekly', priority))
    }
  }
  return urlset(entries)
}

export function sitemapQuranXml(): string {
  const entries: string[] = []
  for (const surah of SURAHS) {
    const path = `/quran/${surah.number}`
    for (const locale of ALL_LOCALES) {
      entries.push(urlEntry(path, locale, 'monthly', '0.8'))
    }
  }
  return urlset(entries)
}

export function sitemapTafsirXml(): string {
  const entries: string[] = []
  for (const surah of SURAHS) {
    const path = `/tafsir/${surah.number}`
    for (const locale of ALL_LOCALES) {
      entries.push(urlEntry(path, locale, 'monthly', '0.7'))
    }
  }
  return urlset(entries)
}

export function sitemapHadithXml(): string {
  const entries: string[] = []
  for (const collection of HADITH_COLLECTIONS_SEO) {
    for (const path of [`/hadith/${collection.id}`, `/hadith/${collection.id}/books`]) {
      for (const locale of ALL_LOCALES) {
        entries.push(urlEntry(path, locale, 'monthly', '0.6'))
      }
    }
  }
  return urlset(entries)
}

export function sitemapHadithEntriesXml(): string {
  const entries: string[] = []
  for (const collection of HADITH_COLLECTIONS_SEO) {
    const max = HADITH_ENTRY_RANGE[collection.id] ?? 40
    for (let n = 1; n <= max; n++) {
      const path = `/hadith/${collection.id}/${n}`
      for (const locale of ALL_LOCALES) {
        entries.push(urlEntry(path, locale, 'monthly', '0.5'))
      }
    }
  }
  return urlset(entries)
}

export function sitemapDuasXml(): string {
  const entries: string[] = []
  for (const id of DUA_CATEGORY_IDS) {
    const path = `/duas/${id}`
    for (const locale of ALL_LOCALES) {
      entries.push(urlEntry(path, locale, 'monthly', '0.6'))
    }
  }
  return urlset(entries)
}

export function sitemapCitiesXml(): string {
  const entries: string[] = []
  const year = 2027
  for (const city of SEO_CITIES) {
    for (const path of [
      `/prayer_times/${city.slug}`,
      `/qibla/${city.slug}`,
      `/ramadan/${year}/${city.slug}`,
    ]) {
      for (const locale of ALL_LOCALES) {
        entries.push(urlEntry(path, locale, 'daily', '0.7'))
      }
    }
  }
  return urlset(entries)
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
