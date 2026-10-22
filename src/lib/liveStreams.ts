/**
 * Official Saudi Broadcasting Authority holy mosque live feeds via Aloula.
 *
 * Aloula player API (aloula.faulio.com) returns signed Kwikmotion HLS with
 * 1920x1080 / 854x480 / 640x360 variants and advertising: null.
 * Direct browser calls are CORS-blocked; use the Vite /api/aloula proxy.
 *
 * Akamai Globecast Roku masters (max 480x384) are SD-only fallbacks.
 */

export type LiveTab = 'makkah' | 'madinah'

/** Aloula channel URL slugs (see /api/v1/channels). */
export const ALOULA_LIVE_SLUGS: Record<LiveTab, 'quran' | 'sunna'> = {
  makkah: 'quran',
  madinah: 'sunna',
}

/** SD-only fallbacks when Aloula/Kwikmotion is unreachable. */
export const HLS_SD_FALLBACKS: Record<LiveTab, string> = {
  makkah: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
  madinah: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8',
}

export const LIVE_ATTRIBUTION = {
  source: 'Saudi Broadcasting Authority (Aloula)',
  url: 'https://www.aloula.sa',
} as const
