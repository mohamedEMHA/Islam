/** Allowlisted proxy routes. Shared by Worker and unit tests. */
export type ProxyRoute =
  | { service: 'sunnah'; rest: string; search: string }
  | { service: 'ummah'; rest: string; search: string }
  | { service: 'aloula'; rest: string; search: string }

const SUNNAH_GET =
  /^\/collections(?:\/[A-Za-z0-9_-]+(?:\/books(?:\/\d+(?:\/(?:chapters|hadiths))?)?)?)?$/
const UMMAH_GET =
  /^(?:\/names(?:\/\d+)?|\/quran\/surah\/\d+\/ayah\/\d+|\/hadith\/[A-Za-z0-9_-]+\/\d+|\/duas\/category\/[A-Za-z0-9_-]+|\/tafsir\/[A-Za-z0-9_.-]+\/surah\/\d+\/ayah\/\d+)$/
const UMMAH_POST = /^\/zakat\/calculate$/
const ALOULA_GET = /^\/api\/(?:v1\/channels|v1\.1\/channels\/\d+\/player)$/

const SUNNAH_QUERY_KEYS = new Set(['limit', 'offset'])
const UMMAH_QUERY_KEYS = new Set(['gender', 'origin', 'search', 'page', 'limit'])
const ALOULA_QUERY_KEYS = new Set<string>()

const ALLOWED_PROXY_CONTENT_TYPES = [
  'application/json',
  'application/vnd.apple.mpegurl',
] as const

export const UMMAH_POST_MAX_BYTES = 4096

export function isSafeRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.includes('://') && !path.includes('..')
}

function filterSearch(search: string, allowedKeys: Set<string>): string {
  if (!search || search === '?') return ''
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const filtered = new URLSearchParams()
  for (const key of allowedKeys) {
    if (!params.has(key)) continue
    for (const value of params.getAll(key)) {
      filtered.append(key, value)
    }
  }
  const serialized = filtered.toString()
  return serialized ? `?${serialized}` : ''
}

export function isAllowedProxyContentType(contentType: string | null): boolean {
  if (!contentType) return false
  const mediaType = contentType.split(';')[0]?.trim().toLowerCase() ?? ''
  return (ALLOWED_PROXY_CONTENT_TYPES as readonly string[]).includes(mediaType)
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') ?? 'unknown'
}

/** Shared API rate-limit gate (proxy + Sunnah SEO enrich). */
export async function consumeApiRateLimit(
  request: Request,
  limiter: { limit: (opts: { key: string }) => Promise<{ success: boolean }> },
): Promise<boolean> {
  const { success } = await limiter.limit({ key: clientIp(request) })
  return success
}

/** Returns null when the POST is allowed, otherwise an HTTP error status. */
export function validateUmmahPost(request: Request): 411 | 413 | 415 | null {
  const contentType = request.headers.get('Content-Type')
  const mediaType = contentType?.split(';')[0]?.trim().toLowerCase() ?? ''
  if (mediaType !== 'application/json') return 415

  // Require Content-Length so chunked bodies cannot bypass the byte cap.
  const lengthHeader = request.headers.get('Content-Length')
  if (lengthHeader == null) return 411

  const length = Number(lengthHeader)
  if (!Number.isFinite(length) || length < 0 || length > UMMAH_POST_MAX_BYTES) {
    return 413
  }

  return null
}

export function matchProxyRoute(
  method: string,
  pathname: string,
  search: string,
): ProxyRoute | 'not_found' | 'method_not_allowed' | 'invalid_path' {
  if (pathname.startsWith('/api/sunnah')) {
    const rest = pathname.slice('/api/sunnah'.length) || '/'
    if (!isSafeRelativePath(rest)) return 'invalid_path'
    if (method !== 'GET' && method !== 'HEAD') return 'method_not_allowed'
    if (!SUNNAH_GET.test(rest)) return 'not_found'
    return { service: 'sunnah', rest, search: filterSearch(search, SUNNAH_QUERY_KEYS) }
  }

  if (pathname.startsWith('/api/aloula')) {
    const rest = pathname.slice('/api/aloula'.length) || '/'
    if (!isSafeRelativePath(rest)) return 'invalid_path'
    if (method !== 'GET' && method !== 'HEAD') return 'method_not_allowed'
    if (!ALOULA_GET.test(rest)) return 'not_found'
    return { service: 'aloula', rest, search: filterSearch(search, ALOULA_QUERY_KEYS) }
  }

  if (pathname.startsWith('/api/ummah')) {
    const rest = pathname.slice('/api/ummah'.length) || '/'
    if (!isSafeRelativePath(rest)) return 'invalid_path'
    if (method === 'POST') {
      if (!UMMAH_POST.test(rest)) return 'not_found'
      return { service: 'ummah', rest, search: '' }
    }
    if (method !== 'GET' && method !== 'HEAD') return 'method_not_allowed'
    if (!UMMAH_GET.test(rest)) return 'not_found'
    return { service: 'ummah', rest, search: filterSearch(search, UMMAH_QUERY_KEYS) }
  }

  if (pathname.startsWith('/api/')) {
    return 'not_found'
  }

  return 'not_found'
}
