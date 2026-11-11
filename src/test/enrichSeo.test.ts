import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveSeo } from '../../shared/seo/resolve'
import { enrichHadithSeo, enrichPrayerCitySeo } from '../../worker/seo/enrich'
import { buildHeadExtras, buildRootContent } from '../../worker/seo/inject'

function installCacheMock(store: Map<string, string>) {
  const cache = {
    async match(req: Request) {
      const raw = store.get(req.url)
      return raw == null ? undefined : new Response(raw)
    },
    async put(req: Request, res: Response) {
      store.set(req.url, await res.text())
    },
  }
  vi.stubGlobal('caches', { default: cache })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('enrichPrayerCitySeo', () => {
  it('adds today timings and method note to richText', async () => {
    const store = new Map<string, string>()
    installCacheMock(store)

    const payload = {
      code: 200,
      status: 'OK',
      data: {
        timings: {
          Fajr: '05:10',
          Sunrise: '06:40',
          Dhuhr: '12:05',
          Asr: '14:50',
          Maghrib: '17:20',
          Isha: '18:50',
        },
        date: { readable: '30 Oct 2026', gregorian: { date: '30-10-2026' } },
        meta: { timezone: 'Europe/London', method: { id: 2, name: 'ISNA' } },
      },
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 })),
    )

    const seo = resolveSeo('/prayer_times/london', { indexCityPages: true })
    expect(seo.kind).toBe('prayer_city')
    const stub = seo.richText ?? ''

    const enriched = await enrichPrayerCitySeo(seo)
    expect(enriched.richText).toContain('Fajr 05:10')
    expect(enriched.richText).toContain('Isha 18:50')
    expect(enriched.richText).toContain('Method 2 (ISNA)')
    expect(enriched.richText).toContain('Asr standard (school 0)')
    expect(enriched.richText).toContain('Europe/London')
    expect(enriched.richText?.length ?? 0).toBeGreaterThan(stub.length)
  })

  it('keeps coords stub when AlAdhan fetch fails', async () => {
    installCacheMock(new Map())
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))

    const seo = resolveSeo('/prayer_times/london', { indexCityPages: true })
    const stub = seo.richText
    const enriched = await enrichPrayerCitySeo(seo)
    expect(enriched.richText).toBe(stub)
  })

  it('ignores non prayer_city kinds', async () => {
    const seo = resolveSeo('/quran/1')
    const enriched = await enrichPrayerCitySeo(seo)
    expect(enriched).toEqual(seo)
  })
})

describe('buildRootContent city links', () => {
  it('adds qibla and ramadan related links for prayer_city', () => {
    const seo = resolveSeo('/prayer_times/london', { indexCityPages: true })
    const html = buildRootContent(seo, { richForCrawler: true })
    expect(html).toContain('/qibla/london')
    expect(html).toContain('/ramadan/2027/london')
    expect(html).toContain('/prayer_times')
  })
})

describe('enrichHadithSeo build-time excerpts', () => {
  it('fills richText for bukhari/1 without API key or network', async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    installCacheMock(new Map())

    const seo = resolveSeo('/hadith/bukhari/1')
    expect(seo.kind).toBe('hadith_entry')
    const enriched = await enrichHadithSeo(seo, undefined)
    expect(enriched.richText).toBeTruthy()
    expect(enriched.richText!.length).toBeGreaterThan(40)
    expect(enriched.richText!.toLowerCase()).toMatch(/intention/)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('buildHeadExtras', () => {
  it('omits canonical when noIndex', () => {
    const seo = resolveSeo('/this-does-not-exist')
    expect(seo.noIndex).toBe(true)
    const head = buildHeadExtras(seo)
    expect(head).not.toContain('rel="canonical"')
    expect(head).toContain('noindex')
  })

  it('includes canonical on indexable pages', () => {
    const seo = resolveSeo('/quran/1')
    const head = buildHeadExtras(seo)
    expect(head).toContain('rel="canonical"')
    expect(head).toContain('https://islam.house/quran/1')
  })
})
