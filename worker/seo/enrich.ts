import type { ResolvedSeo } from '../../shared/seo/resolve.ts'
import surahExcerpts from '../../shared/seo/surah_excerpts.json'

const AYAH_TIMEOUT_MS = 4_000
const CACHE_TTL_SECONDS = 86_400

interface SurahAyah {
  numberInSurah: number
  text: string
}

interface SurahExcerpt {
  ar: SurahAyah[]
  en: SurahAyah[]
}

const EXCERPTS = surahExcerpts as Record<string, SurahExcerpt>

/** Enrich surah SEO from build-time excerpts (no outbound fetch). */
export async function enrichSurahSeo(seo: ResolvedSeo): Promise<ResolvedSeo> {
  if (!seo.surah || (seo.kind !== 'surah' && seo.kind !== 'tafsir_surah')) return seo

  const excerpt = EXCERPTS[String(seo.surah.number)]
  if (!excerpt?.ar?.length) return seo

  const parts = excerpt.ar.slice(0, 3).map((ayah) => {
    const enText = excerpt.en?.find((a) => a.numberInSurah === ayah.numberInSurah)?.text
    const base = `${ayah.numberInSurah}. ${ayah.text}`
    return enText ? `${base} (${enText})` : base
  })

  return { ...seo, richText: parts.join(' ') }
}

interface SunnahHadithPayload {
  hadith?: Array<{
    body?: string
    chapterTitle?: string
  }>
  collection?: string
}

export async function enrichHadithSeo(
  seo: ResolvedSeo,
  apiKey: string | undefined,
): Promise<ResolvedSeo> {
  if (seo.kind !== 'hadith_entry' || !seo.hadithCollectionId || !seo.hadithId || !apiKey) {
    return seo
  }

  const collection = seo.hadithCollectionId
  const hadithNumber = seo.hadithId
  const cacheKey = `https://islam.house/seo-cache/hadith/${collection}/${hadithNumber}`
  const url = `https://api.sunnah.com/v1/collections/${collection}/hadiths/${hadithNumber}`

  const cache = caches.default
  const cacheReq = new Request(cacheKey)
  const hit = await cache.match(cacheReq)
  let raw: string | null = hit ? await hit.text() : null

  if (!raw) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), AYAH_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'X-API-KEY': apiKey,
        },
      })
      if (res.ok) {
        raw = await res.text()
        void cache.put(
          cacheReq,
          new Response(raw, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
            },
          }),
        )
      }
    } catch {
      raw = null
    } finally {
      clearTimeout(timer)
    }
  }

  if (!raw) return seo

  try {
    const data = JSON.parse(raw) as SunnahHadithPayload
    const body = data.hadith?.[0]?.body?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!body) return seo
    const excerpt = body.length > 400 ? `${body.slice(0, 400)}…` : body
    return {
      ...seo,
      description: excerpt.slice(0, 160),
      richText: excerpt,
    }
  } catch {
    return seo
  }
}
