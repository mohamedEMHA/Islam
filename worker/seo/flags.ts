/** SEO feature flags. Off by default in tests; enable via Worker env in production. */

export interface SeoFlags {
  /** Full surah/hadith body in no-JS HTML for crawlers only. */
  richHtml: boolean
  /** Index and serve programmatic city landing pages. */
  cityPages: boolean
}

export function parseSeoFlags(env: {
  SEO_RICH_HTML?: string
  SEO_CITY_PAGES?: string
}): SeoFlags {
  return {
    richHtml: env.SEO_RICH_HTML === '1' || env.SEO_RICH_HTML === 'true',
    cityPages: env.SEO_CITY_PAGES === '1' || env.SEO_CITY_PAGES === 'true',
  }
}

/** Known search / AI-retrieval crawlers (not training scrapers). */
const CRAWLER_UA =
  /Googlebot|Bingbot|DuckDuckBot|Slurp|YandexBot|Baiduspider|Applebot|DuckAssistBot|OAI-SearchBot|ChatGPT-User|PerplexityBot|Perplexity-User|Claude-SearchBot|Claude-User|facebookexternalhit|Twitterbot|LinkedInBot|Discordbot|WhatsApp/i

export function isSeoCrawler(request: Request): boolean {
  const ua = request.headers.get('User-Agent') ?? ''
  if (!ua || ua.length < 8) return false
  return CRAWLER_UA.test(ua)
}

/** Rich HTML only for crawlers when the flag is on (Strategy A: no UI flash). */
export function shouldInjectRichHtml(request: Request, flags: SeoFlags): boolean {
  return flags.richHtml && isSeoCrawler(request)
}
