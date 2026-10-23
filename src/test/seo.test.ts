import { describe, expect, it } from 'vitest'
import {
  hreflangAlternates,
  localizedPath,
  parseLocalePath,
} from '../../shared/seo/locale'
import { resolveSeo } from '../../shared/seo/resolve'
import { getCityBySlug, SEO_CITIES } from '../../shared/seo/cities'
import {
  sitemapCitiesXml,
  sitemapDuasXml,
  sitemapHadithEntriesXml,
  sitemapHadithXml,
  sitemapIndexXml,
  sitemapPagesXml,
  sitemapQuranXml,
  sitemapTafsirXml,
  SITEMAP_LASTMOD,
} from '../../worker/seo/sitemap'
import { buildJsonLdGraph } from '../../worker/seo/schema'
import { robotsTxt, llmsTxt, llmsFullTxt, seoToMarkdown } from '../../worker/seo/llms'
import { parseSeoFlags, shouldInjectRichHtml, isSeoCrawler } from '../../worker/seo/flags'
import { INDEXNOW_KEY, indexNowKeyPath } from '../../worker/seo/indexNow'

describe('locale path helpers', () => {
  it('parses unprefixed English paths', () => {
    expect(parseLocalePath('/quran/1')).toEqual({
      locale: 'en',
      pathWithoutLocale: '/quran/1',
    })
  })

  it('parses locale prefixes', () => {
    expect(parseLocalePath('/ar/quran/1')).toEqual({
      locale: 'ar',
      pathWithoutLocale: '/quran/1',
    })
    expect(parseLocalePath('/fr')).toEqual({
      locale: 'fr',
      pathWithoutLocale: '/',
    })
  })

  it('builds localized paths with English as default', () => {
    expect(localizedPath('/quran', 'en')).toBe('/quran')
    expect(localizedPath('/quran', 'ar')).toBe('/ar/quran')
    expect(localizedPath('/', 'ur')).toBe('/ur')
  })

  it('emits hreflang alternates including x-default', () => {
    const alts = hreflangAlternates('/quran/1')
    expect(alts.find((a) => a.hreflang === 'x-default')?.href).toBe(
      'https://islam.house/quran/1',
    )
    expect(alts.find((a) => a.hreflang === 'ar')?.href).toBe(
      'https://islam.house/ar/quran/1',
    )
    expect(alts).toHaveLength(6)
  })
})

describe('resolveSeo', () => {
  it('resolves home and static routes', () => {
    const home = resolveSeo('/')
    expect(home.status).toBe(200)
    expect(home.kind).toBe('static')
    expect(home.title).toMatch(/Islam/i)
    expect(home.noIndex).toBe(false)
  })

  it('resolves Arabic surah with RTL', () => {
    const seo = resolveSeo('/ar/quran/1')
    expect(seo.status).toBe(200)
    expect(seo.kind).toBe('surah')
    expect(seo.locale).toBe('ar')
    expect(seo.dir).toBe('rtl')
    expect(seo.surah?.number).toBe(1)
    expect(seo.canonicalPath).toBe('/ar/quran/1')
  })

  it('uses distinct meta for fr/ur/id surah pages (not English duplicates)', () => {
    const en = resolveSeo('/quran/36')
    const fr = resolveSeo('/fr/quran/36')
    const ur = resolveSeo('/ur/quran/36')
    const id = resolveSeo('/id/quran/36')
    expect(fr.title).not.toBe(en.title)
    expect(fr.description).not.toBe(en.description)
    expect(ur.title).not.toBe(en.title)
    expect(id.description).not.toBe(en.description)
    expect(fr.title.toLowerCase()).toContain('sourate')
  })

  it('marks utility pages noindex', () => {
    expect(resolveSeo('/settings').noIndex).toBe(true)
    expect(resolveSeo('/share').noIndex).toBe(true)
    expect(resolveSeo('/welcome').noIndex).toBe(true)
    expect(resolveSeo('/search').noIndex).toBe(true)
  })

  it('serves embed prayer_times as 200 noindex (not 404)', () => {
    const seo = resolveSeo('/embed/prayer_times')
    expect(seo.status).toBe(200)
    expect(seo.kind).toBe('static')
    expect(seo.noIndex).toBe(true)
  })

  it('returns real 404 for unknown paths', () => {
    const seo = resolveSeo('/this-does-not-exist')
    expect(seo.status).toBe(404)
    expect(seo.kind).toBe('not_found')
    expect(seo.noIndex).toBe(true)
  })

  it('rejects invalid surah numbers as 404', () => {
    expect(resolveSeo('/quran/999').status).toBe(404)
  })

  it('resolves hadith collection and entry', () => {
    const col = resolveSeo('/hadith/bukhari')
    expect(col.kind).toBe('hadith_collection')
    const entry = resolveSeo('/fr/hadith/muslim/1')
    expect(entry.kind).toBe('hadith_entry')
    expect(entry.locale).toBe('fr')
    expect(entry.hadithId).toBe('1')
    expect(entry.title.toLowerCase()).toContain('hadith')
  })

  it('rejects unsafe hadith ids as 404 without treating them as entries', () => {
    expect(resolveSeo('/hadith/bukhari/abc').kind).toBe('not_found')
    expect(resolveSeo('/hadith/bukhari/../../etc').kind).toBe('not_found')
    expect(resolveSeo('/hadith/bukhari/1<script>').kind).toBe('not_found')
    expect(resolveSeo('/hadith/bukhari/123456').kind).toBe('not_found')
    expect(resolveSeo('/hadith/bukhari/1a').kind).toBe('hadith_entry')
  })

  it('resolves city prayer, qibla, ramadan, and dua category pages', () => {
    const prayer = resolveSeo('/prayer_times/london')
    expect(prayer.kind).toBe('prayer_city')
    expect(prayer.city?.slug).toBe('london')
    expect(resolveSeo('/qibla/jakarta').kind).toBe('qibla_city')
    expect(resolveSeo('/ramadan/2027/paris').kind).toBe('ramadan_city')
    expect(resolveSeo('/duas/morning').kind).toBe('dua_category')
  })

  it('noindexes city pages when indexCityPages is false', () => {
    const seo = resolveSeo('/prayer_times/london', { indexCityPages: false })
    expect(seo.kind).toBe('prayer_city')
    expect(seo.noIndex).toBe(true)
  })
})

describe('sitemaps', () => {
  it('builds sitemap index with lastmod and optional cities', () => {
    const xml = sitemapIndexXml(true)
    expect(xml).toContain('sitemap_pages.xml')
    expect(xml).toContain('sitemap_hadith_entries.xml')
    expect(xml).toContain('sitemap_duas.xml')
    expect(xml).toContain('sitemap_cities.xml')
    expect(xml).toContain(`<lastmod>${SITEMAP_LASTMOD}</lastmod>`)
    expect(sitemapIndexXml(false)).not.toContain('sitemap_cities.xml')
  })

  it('includes hreflang and lastmod in page and quran sitemaps', () => {
    expect(sitemapPagesXml()).toContain('hreflang="ar"')
    expect(sitemapPagesXml()).toContain('<lastmod>')
    expect(sitemapQuranXml()).toContain('/quran/114')
    expect(sitemapQuranXml()).toContain('/ar/quran/1')
    expect(sitemapTafsirXml()).toContain('/tafsir/1')
    expect(sitemapHadithXml()).toContain('/hadith/bukhari')
    expect(sitemapHadithEntriesXml()).toContain('/hadith/bukhari/1')
    expect(sitemapDuasXml()).toContain('/duas/morning')
    expect(sitemapCitiesXml()).toContain('/prayer_times/london')
  })
})

describe('schema and AI files', () => {
  it('builds JSON-LD graph with WebSite SearchAction and islam.house org', () => {
    const graph = buildJsonLdGraph(resolveSeo('/'))
    const json = JSON.stringify(graph)
    expect(json).toContain('SearchAction')
    expect(json).toContain('Organization')
    expect(json).toContain('islam.house')
    expect(json).toContain('FAQPage')
    expect(json).toContain('BreadcrumbList')
  })

  it('includes Chapter for surah pages', () => {
    const graph = buildJsonLdGraph(resolveSeo('/quran/1'))
    expect(JSON.stringify(graph)).toContain('"Chapter"')
  })

  it('exposes robots and llms text aligned with AI Crawl Control', () => {
    const robots = robotsTxt()
    expect(robots).toContain('User-agent: OAI-SearchBot\nAllow: /')
    expect(robots).toContain('User-agent: GPTBot\nDisallow: /')
    expect(robots).toContain('Sitemap: https://islam.house/sitemap.xml')
    expect(llmsTxt()).toContain('https://islam.house/quran')
    expect(llmsFullTxt()).toContain('llms-full')
    expect(llmsFullTxt()).toContain('Example city')
  })

  it('builds Quotation schema for hadith entries', () => {
    const graph = buildJsonLdGraph(resolveSeo('/hadith/bukhari/1'))
    expect(JSON.stringify(graph)).toContain('"Quotation"')
  })

  it('renders markdown for a resolved page', () => {
    const md = seoToMarkdown(resolveSeo('/quran/1'))
    expect(md).toContain('#')
    expect(md).toContain('Canonical:')
  })
})

describe('SEO flags and crawler strategy', () => {
  it('parses env flags', () => {
    expect(parseSeoFlags({ SEO_RICH_HTML: '1', SEO_CITY_PAGES: '0' })).toEqual({
      richHtml: true,
      cityPages: false,
    })
  })

  it('detects Googlebot and gates rich HTML', () => {
    const bot = new Request('https://islam.house/quran/1', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
    })
    const browser = new Request('https://islam.house/quran/1', {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0' },
    })
    expect(isSeoCrawler(bot)).toBe(true)
    expect(isSeoCrawler(browser)).toBe(false)
    expect(shouldInjectRichHtml(bot, { richHtml: true, cityPages: true })).toBe(true)
    expect(shouldInjectRichHtml(browser, { richHtml: true, cityPages: true })).toBe(false)
  })

})

describe('cities and IndexNow', () => {
  it('has unique city slugs and resolvable entries', () => {
    const slugs = SEO_CITIES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(getCityBySlug('mecca')?.country).toBe('SA')
  })

  it('exposes IndexNow key path', () => {
    expect(indexNowKeyPath()).toBe(`/${INDEXNOW_KEY}.txt`)
    expect(INDEXNOW_KEY.length).toBeGreaterThan(8)
  })
})

describe('security.txt', () => {
  it('exposes RFC 9116 security.txt with contact and expiry', async () => {
    const { securityTxt } = await import('../../worker/seo/securityTxt')
    const body = securityTxt()
    expect(body).toContain('Contact: mailto:security@islam.house')
    expect(body).toContain('Expires:')
    expect(body).toContain('Canonical: https://islam.house/.well-known/security.txt')
  })
})
