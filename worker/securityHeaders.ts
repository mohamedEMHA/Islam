/** Shared CSP / security headers. Imported by the Worker entry and unit tests. */

/** sha256 of the inline theme bootstrap in index.html (must stay in sync; see securityHeaders.test). */
export const THEME_SCRIPT_SHA256 = 'sha256-TMo242EKGbIawOLRri4d5LEy0amUUaSBv9twAqsAAO8='

const CONNECT_SRC = [
  "'self'",
  'https://api.aladhan.com',
  'https://api.alquran.cloud',
  'https://api.quran.com',
  'https://api.qurancdn.com',
  'https://cdn.jsdelivr.net',
  'https://download.quranicaudio.com',
  'https://api.islamic.app',
  'https://mp3quran.net',
  'https://www.mp3quran.net',
  'https://backup.qurango.net',
  'https://qurango.net',
  'https://Qurango.net',
  'https://stream.radiojar.com',
  'https://nominatim.openstreetmap.org',
  'https://overpass-api.de',
  'https://overpass.kumi.systems',
  'https://world.openfoodfacts.org',
  'https://xaus.com',
  'https://raw.githubusercontent.com',
  'https://static.cloudflareinsights.com',
  'https://cloudflareinsights.com',
  'https://cdn-globecast.akamaized.net',
  'https://live.kwikmotion.com',
].join(' ')

export interface SecurityHeaderOptions {
  /** Allow iframe embedding (embed routes only). */
  allowFraming?: boolean
}

export function buildContentSecurityPolicy(
  nonce?: string,
  options: SecurityHeaderOptions = {},
): string {
  const scriptSrc = [
    "'self'",
    `'${THEME_SCRIPT_SHA256}'`,
    ...(nonce ? [`'nonce-${nonce}'`] : []),
    'https://static.cloudflareinsights.com',
  ].join(' ')

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    `connect-src ${CONNECT_SRC}`,
    options.allowFraming ? 'frame-ancestors *' : "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

export function buildSecurityHeaders(
  nonce?: string,
  options: SecurityHeaderOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(self), geolocation=(self), microphone=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': buildContentSecurityPolicy(nonce, options),
  }
  if (!options.allowFraming) {
    headers['X-Frame-Options'] = 'DENY'
  }
  return headers
}

/** Default headers for non-HTML / static responses (no nonce). */
export const SECURITY_HEADERS: Record<string, string> = buildSecurityHeaders()
