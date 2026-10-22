import {
  clientIp,
  isAllowedProxyContentType,
  isSafeRelativePath,
  matchProxyRoute,
  validateUmmahPost,
  type ProxyRoute,
} from './allowlist'
import { apexRedirectUrl } from './redirect'
import { buildSecurityHeaders, SECURITY_HEADERS } from './securityHeaders'
import { enrichHadithSeo, enrichSurahSeo } from './seo/enrich'
import { injectSeo } from './seo/inject'
import { llmsTxt, robotsTxt } from './seo/llms'
import {
  sitemapHadithXml,
  sitemapIndexXml,
  sitemapPagesXml,
  sitemapQuranXml,
  sitemapTafsirXml,
  xmlResponse,
} from './seo/sitemap'
import { isHtmlNavigation, resolveSeo } from '../shared/seo/resolve'
import { SEO_BUILD_ID } from './build_id'

export type { ProxyRoute }
export {
  clientIp,
  isAllowedProxyContentType,
  isSafeRelativePath,
  matchProxyRoute,
  validateUmmahPost,
  apexRedirectUrl,
}
export { SECURITY_HEADERS, buildSecurityHeaders }

export interface Env {
  ASSETS: Fetcher
  SUNNAH_API_KEY?: string
  UMMAH_API_KEY?: string
  API_RATE_LIMITER: RateLimit
}

const PROXY_TIMEOUT_MS = 15_000
const SEO_HTML_TTL_SECONDS = 3_600

function withSecurityHeaders(response: Response, nonce?: string): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(buildSecurityHeaders(nonce))) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function createCspNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function jsonError(message: string, status: number): Response {
  return withSecurityHeaders(Response.json({ error: message }, { status }))
}

function buildProxyResponseHeaders(upstream: Response, cacheSeconds: number): Headers {
  const headers = new Headers()
  const contentType = upstream.headers.get('Content-Type')
  if (contentType) headers.set('Content-Type', contentType)
  if (cacheSeconds > 0 && upstream.ok) {
    headers.set(
      'Cache-Control',
      `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=${Math.min(cacheSeconds, 86400)}`,
    )
  } else if (!upstream.ok || cacheSeconds <= 0) {
    headers.set('Cache-Control', 'no-store')
  }
  return headers
}

async function proxyRequest(
  targetUrl: string,
  request: Request,
  initHeaders: HeadersInit = {},
  cacheSeconds = 0,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS)
  const isGetLike = request.method === 'GET' || request.method === 'HEAD'

  try {
    const headers = new Headers(initHeaders)
    const contentType = request.headers.get('Content-Type')
    if (contentType && !isGetLike) {
      headers.set('Content-Type', contentType)
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', request.headers.get('Accept') ?? 'application/json')
    }

    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: isGetLike ? undefined : request.body,
      signal: controller.signal,
      redirect: 'manual',
      ...(isGetLike && cacheSeconds > 0
        ? {
            cf: {
              cacheEverything: true,
              cacheTtl: cacheSeconds,
            },
          }
        : {}),
    })

    if (upstream.status >= 300 && upstream.status < 400) {
      return jsonError('Upstream redirect rejected', 502)
    }

    if (!isAllowedProxyContentType(upstream.headers.get('Content-Type'))) {
      return jsonError('Upstream content type rejected', 502)
    }

    return withSecurityHeaders(
      new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: buildProxyResponseHeaders(upstream, cacheSeconds),
      }),
    )
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'AbortError'
        ? 'Upstream request timed out'
        : 'Upstream request failed'
    return jsonError(message, 502)
  } finally {
    clearTimeout(timeout)
  }
}

function textResponse(body: string, contentType: string): Response {
  return withSecurityHeaders(
    new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    }),
  )
}

async function buildSeoDocument(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  let seo = resolveSeo(url.pathname)

  if (seo.kind === 'surah' || seo.kind === 'tafsir_surah') {
    seo = await enrichSurahSeo(seo)
  } else if (seo.kind === 'hadith_entry') {
    const { success } = await env.API_RATE_LIMITER.limit({ key: clientIp(request) })
    if (success) {
      seo = await enrichHadithSeo(seo, env.SUNNAH_API_KEY)
    }
  }

  // Fresh nonce per response; do not cache the final HTML (nonce must stay unique).
  const nonce = createCspNonce()
  const assetRequest = new Request(new URL('/index.html', url.origin).toString(), {
    method: 'GET',
    headers: { Accept: 'text/html' },
  })
  const assetResponse = await env.ASSETS.fetch(assetRequest)
  const injected = injectSeo(assetResponse, seo, nonce)
  const headers = new Headers(injected.headers)
  headers.set(
    'Cache-Control',
    `public, max-age=${SEO_HTML_TTL_SECONDS}, s-maxage=${SEO_HTML_TTL_SECONDS}, stale-while-revalidate=86400`,
  )
  headers.set('X-SEO-Build', SEO_BUILD_ID)

  return withSecurityHeaders(
    new Response(injected.body, {
      status: injected.status,
      statusText: injected.statusText,
      headers,
    }),
    nonce,
  )
}

async function handleSeoDocument(request: Request, env: Env): Promise<Response> {
  return buildSeoDocument(request, env)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const apexTarget = apexRedirectUrl(request.url)
    if (apexTarget) {
      return Response.redirect(apexTarget, 301)
    }

    const url = new URL(request.url)
    const { pathname, search } = url

    if (pathname === '/robots.txt') {
      return textResponse(robotsTxt(), 'text/plain; charset=utf-8')
    }
    if (pathname === '/llms.txt') {
      return textResponse(llmsTxt(), 'text/plain; charset=utf-8')
    }
    if (pathname === '/sitemap.xml') {
      return withSecurityHeaders(xmlResponse(sitemapIndexXml()))
    }
    if (pathname === '/sitemap_pages.xml') {
      return withSecurityHeaders(xmlResponse(sitemapPagesXml()))
    }
    if (pathname === '/sitemap_quran.xml') {
      return withSecurityHeaders(xmlResponse(sitemapQuranXml()))
    }
    if (pathname === '/sitemap_tafsir.xml') {
      return withSecurityHeaders(xmlResponse(sitemapTafsirXml()))
    }
    if (pathname === '/sitemap_hadith.xml') {
      return withSecurityHeaders(xmlResponse(sitemapHadithXml()))
    }

    if (!pathname.startsWith('/api/')) {
      if (isHtmlNavigation(request)) {
        return handleSeoDocument(request, env)
      }
      return withSecurityHeaders(await env.ASSETS.fetch(request))
    }

    const { success } = await env.API_RATE_LIMITER.limit({ key: clientIp(request) })
    if (!success) {
      return jsonError('Too many requests', 429)
    }

    const matched = matchProxyRoute(request.method, pathname, search)
    if (matched === 'invalid_path') return jsonError('Invalid path', 400)
    if (matched === 'method_not_allowed') return jsonError('Method not allowed', 405)
    if (matched === 'not_found') return jsonError('Not found', 404)

    if (matched.service === 'sunnah') {
      if (!env.SUNNAH_API_KEY) return jsonError('Sunnah API not configured', 503)
      return proxyRequest(
        `https://api.sunnah.com/v1${matched.rest}${matched.search}`,
        request,
        { 'X-API-KEY': env.SUNNAH_API_KEY },
        86_400,
      )
    }

    if (matched.service === 'aloula') {
      return proxyRequest(
        `https://aloula.faulio.com${matched.rest}${matched.search}`,
        request,
        {
          Origin: 'https://www.aloula.sa',
          Referer: 'https://www.aloula.sa/',
        },
        30,
      )
    }

    if (!env.UMMAH_API_KEY) return jsonError('Ummah API not configured', 503)
    if (request.method === 'POST') {
      const postError = validateUmmahPost(request)
      if (postError) {
        return jsonError(
          postError === 413 ? 'Payload too large' : 'Unsupported media type',
          postError,
        )
      }
    }
    return proxyRequest(
      `https://ummahapi.com/api${matched.rest}${matched.search}`,
      request,
      { 'X-API-Key': env.UMMAH_API_KEY },
      matched.rest === '/zakat/calculate' ? 0 : 3_600,
    )
  },
} satisfies ExportedHandler<Env>
