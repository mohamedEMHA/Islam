import type { ResolvedSeo } from '../../shared/seo/resolve.ts'
import surahExcerpts from '../../shared/seo/surah_excerpts.json'
import hadithExcerpts from '../../shared/seo/hadith_excerpts.json'

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
const HADITH_EXCERPTS = hadithExcerpts as Record<string, string>

function clipHadithExcerpt(body: string): string {
  return body.length > 400 ? `${body.slice(0, 400)}…` : body
}

export interface EnrichSurahOptions {
  /** Include all excerpt ayahs (up to available) for crawler-rich mode. */
  fullExcerpt?: boolean
}

/** Enrich surah SEO from build-time excerpts (no outbound fetch). */
export async function enrichSurahSeo(
  seo: ResolvedSeo,
  options: EnrichSurahOptions = {},
): Promise<ResolvedSeo> {
  if (!seo.surah || (seo.kind !== 'surah' && seo.kind !== 'tafsir_surah')) return seo

  const excerpt = EXCERPTS[String(seo.surah.number)]
  if (!excerpt?.ar?.length) return seo

  const limit = options.fullExcerpt ? excerpt.ar.length : 3
  const parts = excerpt.ar.slice(0, limit).map((ayah) => {
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

const PRAYER_SEO_METHOD = 2
const PRAYER_SEO_SCHOOL = 0

interface AlAdhanTimingsPayload {
  data?: {
    timings?: Record<string, string>
    date?: { gregorian?: { date?: string } }
    meta?: { timezone?: string; method?: { id?: number; name?: string } }
  }
}

function todayInTimezone(timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function stripTimeSuffix(value: string): string {
  return value.trim().split(/\s+/)[0] ?? value
}

/** Enrich prayer city SEO with today's AlAdhan timings (method 2 / school 0). */
export async function enrichPrayerCitySeo(seo: ResolvedSeo): Promise<ResolvedSeo> {
  if (seo.kind !== 'prayer_city' || !seo.city) return seo

  const city = seo.city
  const dateKey = todayInTimezone(city.timezone)
  const cacheKey = `https://islam.house/seo-cache/prayer/${city.slug}/${dateKey}/${PRAYER_SEO_METHOD}/${PRAYER_SEO_SCHOOL}`
  const url = `https://api.aladhan.com/v1/timings?latitude=${city.lat}&longitude=${city.lng}&method=${PRAYER_SEO_METHOD}&school=${PRAYER_SEO_SCHOOL}`

  const cache = caches.default
  const cacheReq = new Request(cacheKey)
  let raw: string | null = null
  try {
    const hit = await cache.match(cacheReq)
    raw = hit ? await hit.text() : null
  } catch {
    raw = null
  }

  if (!raw) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), AYAH_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        raw = await res.text()
        try {
          void cache.put(
            cacheReq,
            new Response(raw, {
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
              },
            }),
          )
        } catch {
          /* cache optional in tests / non-Worker runtimes */
        }
      }
    } catch {
      raw = null
    } finally {
      clearTimeout(timer)
    }
  }

  if (!raw) return seo

  try {
    const data = JSON.parse(raw) as AlAdhanTimingsPayload
    const timings = data.data?.timings
    if (!timings?.Fajr || !timings?.Isha) return seo

    const tz = data.data?.meta?.timezone ?? city.timezone
    const gregorian = data.data?.date?.gregorian?.date ?? dateKey
    const methodName = data.data?.meta?.method?.name ?? 'ISNA'
    const bearingStub = seo.richText ?? ''
    const times = [
      `Fajr ${stripTimeSuffix(timings.Fajr)}`,
      `Sunrise ${stripTimeSuffix(timings.Sunrise ?? '')}`,
      `Dhuhr ${stripTimeSuffix(timings.Dhuhr ?? '')}`,
      `Asr ${stripTimeSuffix(timings.Asr ?? '')}`,
      `Maghrib ${stripTimeSuffix(timings.Maghrib ?? '')}`,
      `Isha ${stripTimeSuffix(timings.Isha)}`,
    ]
      .filter((part) => /\d/.test(part))
      .join(', ')

    const richText = [
      `Today (${gregorian}, ${tz}): ${times}.`,
      `Method ${PRAYER_SEO_METHOD} (${methodName}), Asr standard (school ${PRAYER_SEO_SCHOOL}).`,
      bearingStub,
    ]
      .filter(Boolean)
      .join(' ')

    return { ...seo, richText }
  } catch {
    return seo
  }
}

export async function enrichHadithSeo(
  seo: ResolvedSeo,
  apiKey: string | undefined,
): Promise<ResolvedSeo> {
  if (seo.kind !== 'hadith_entry' || !seo.hadithCollectionId || !seo.hadithId) {
    return seo
  }

  const collection = seo.hadithCollectionId
  const hadithNumber = seo.hadithId
  const excerptKey = `${collection}/${hadithNumber}`
  const builtIn = HADITH_EXCERPTS[excerptKey]?.trim()
  if (builtIn) {
    const excerpt = clipHadithExcerpt(builtIn)
    return {
      ...seo,
      description: excerpt.slice(0, 160),
      richText: excerpt,
    }
  }

  if (!apiKey) return seo

  const cacheKey = `https://islam.house/seo-cache/hadith/${collection}/${hadithNumber}`
  const url = `https://api.sunnah.com/v1/collections/${collection}/hadiths/${hadithNumber}`

  let raw: string | null = null
  try {
    const cache = caches.default
    const cacheReq = new Request(cacheKey)
    const hit = await cache.match(cacheReq)
    raw = hit ? await hit.text() : null

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
          try {
            void cache.put(
              cacheReq,
              new Response(raw, {
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
                },
              }),
            )
          } catch {
            /* cache optional outside Workers */
          }
        }
      } catch {
        raw = null
      } finally {
        clearTimeout(timer)
      }
    }
  } catch {
    return seo
  }

  if (!raw) return seo

  try {
    const data = JSON.parse(raw) as SunnahHadithPayload
    const body = data.hadith?.[0]?.body?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!body) return seo
    const excerpt = clipHadithExcerpt(body)
    return {
      ...seo,
      description: excerpt.slice(0, 160),
      richText: excerpt,
    }
  } catch {
    return seo
  }
}
