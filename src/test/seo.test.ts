import { describe, expect, it } from 'vitest'
import {
  hreflangAlternates,
  localizedPath,
  parseLocalePath,
} from '../../shared/seo/locale'
import { resolveSeo } from '../../shared/seo/resolve'
import {
  sitemapHadithXml,
  sitemapIndexXml,
  sitemapPagesXml,
  sitemapQuranXml,
  sitemapTafsirXml,
} from '../../worker/seo/sitemap'
import { buildJsonLdGraph } from '../../worker/seo/schema'
import { robotsTxt, llmsTxt } from '../../worker/seo/llms'

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
    expect(home.title).toContain('Islam')
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

  it('marks utility pages noindex', () => {
    expect(resolveSeo('/settings').noIndex).toBe(true)
    expect(resolveSeo('/share').noIndex).toBe(true)
    expect(resolveSeo('/welcome').noIndex).toBe(true)
    expect(resolveSeo('/search').noIndex).toBe(true)
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
  })

  it('rejects unsafe hadith ids as 404 without treating them as entries', () => {
    expect(resolveSeo('/hadith/bukhari/abc').kind).toBe('not_found')
    expect(resolveSeo('/hadith/bukhari/../../etc').kind).toBe('not_found')
    expect(resolveSeo('/hadith/bukhari/1<script>').kind).toBe('not_found')
    expect(resolveSeo('/hadith/bukhari/123456').kind).toBe('not_found')
    expect(resolveSeo('/hadith/bukhari/1a').kind).toBe('hadith_entry')
  })
})

describe('sitemaps', () => {
  it('builds sitemap index', () => {
    const xml = sitemapIndexXml()
    expect(xml).toContain('sitemap_pages.xml')
    expect(xml).toContain('sitemap_quran.xml')
    expect(xml).toContain('sitemap_tafsir.xml')
    expect(xml).toContain('sitemap_hadith.xml')
  })

  it('includes hreflang in page and quran sitemaps', () => {
    expect(sitemapPagesXml()).toContain('hreflang="ar"')
    expect(sitemapQuranXml()).toContain('/quran/114')
    expect(sitemapQuranXml()).toContain('/ar/quran/1')
    expect(sitemapTafsirXml()).toContain('/tafsir/1')
    expect(sitemapHadithXml()).toContain('/hadith/bukhari')
  })
})

describe('schema and AI files', () => {
  it('builds JSON-LD graph with WebSite SearchAction', () => {
    const graph = buildJsonLdGraph(resolveSeo('/'))
    const json = JSON.stringify(graph)
    expect(json).toContain('SearchAction')
    expect(json).toContain('Organization')
    expect(json).toContain('BreadcrumbList')
  })

  it('includes Chapter for surah pages', () => {
    const graph = buildJsonLdGraph(resolveSeo('/quran/1'))
    expect(JSON.stringify(graph)).toContain('"Chapter"')
  })

  it('exposes robots and llms text', () => {
    expect(robotsTxt()).toContain('GPTBot')
    expect(robotsTxt()).toContain('ChatGPT-User')
    expect(robotsTxt()).toContain('PerplexityBot')
    expect(robotsTxt()).toContain('ClaudeBot')
    expect(robotsTxt()).toContain('Sitemap: https://islam.house/sitemap.xml')
    expect(llmsTxt()).toContain('https://islam.house/quran')
  })

  it('builds Quotation schema for hadith entries', () => {
    const graph = buildJsonLdGraph(resolveSeo('/hadith/bukhari/1'))
    expect(JSON.stringify(graph)).toContain('"Quotation"')
  })
})
