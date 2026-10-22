import { apiFetch } from './client'

/** Prefer www; apex redirects to www and CSP must allow the final host. */
const BASE = 'https://www.mp3quran.net/api/v3'

/** Stale mp3quran stream paths that Qurango serves as 404 (no CORS on error pages). */
const DEAD_QURANGO_PATHS = new Set([
  '/radio/nourin_siddig',
])

export interface RadioStation {
  id: number
  name: string
  url: string
  recentDate?: string
}

interface RadioApiResponse {
  radios: Array<{
    id: number
    name: string
    url: string
    recent_date?: string
  }>
}

export type RadioLanguage =
  | 'ar'
  | 'eng'
  | 'fr'
  | 'ur'
  | 'id'
  | 'de'
  | 'es'
  | 'tr'
  | 'bn'
  | 'fa'

export function normalizeRadioStationName(name: string): string {
  return name
    .trim()
    .replace(/^(?:radio|راديو|ریڈیو)\s+/iu, '')
    .trim()
}

export function parseRadioStations(payload: RadioApiResponse): RadioStation[] {
  return (payload.radios ?? [])
    .map((station) => ({
      id: station.id,
      name: normalizeRadioStationName(station.name),
      url: station.url.trim(),
      recentDate: station.recent_date,
    }))
    .filter((station) => !isKnownDeadRadioUrl(station.url))
}

export function filterRadioStations(
  stations: RadioStation[],
  query: string,
): RadioStation[] {
  const q = query.trim().toLowerCase()
  if (!q) return stations
  return stations.filter((station) => station.name.toLowerCase().includes(q))
}

export async function getRadioStations(language: RadioLanguage = 'eng'): Promise<RadioStation[]> {
  const data = await apiFetch<RadioApiResponse>(`${BASE}/radios?language=${language}`, {
    source: 'mp3quran.net',
  })
  return parseRadioStations(data)
}

/** Qurango hosts expose CORS on live audio; 404 HTML error pages often do not. */
export function isQurangoRadioUrl(url: string): boolean {
  try {
    return new URL(url).hostname.toLowerCase().includes('qurango.net')
  } catch {
    return false
  }
}

export function isKnownDeadRadioUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase().replace(/\/$/, '')
    return DEAD_QURANGO_PATHS.has(path)
  } catch {
    return false
  }
}

function probeStreamWithAudio(url: string, timeoutMs: number): Promise<'ok' | 'dead' | 'unknown'> {
  if (typeof Audio === 'undefined') return Promise.resolve('unknown')

  return new Promise((resolve) => {
    const audio = new Audio()
    let settled = false

    const finish = (result: 'ok' | 'dead' | 'unknown') => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      audio.onloadeddata = null
      audio.oncanplay = null
      audio.onerror = null
      audio.removeAttribute('src')
      try {
        audio.load()
      } catch {
        // ignore
      }
      resolve(result)
    }

    const timer = window.setTimeout(() => finish('unknown'), timeoutMs)
    audio.preload = 'auto'
    audio.onloadeddata = () => finish('ok')
    audio.oncanplay = () => finish('ok')
    audio.onerror = () => finish('dead')
    audio.src = url
  })
}

/**
 * Drop unreachable Qurango streams. Uses Audio probe (no CORS needed) plus a
 * static denylist for known 404 paths like Noreen / nourin_siddig.
 */
export async function filterDeadQurangoStations(
  stations: RadioStation[],
  options: { concurrency?: number; timeoutMs?: number } = {},
): Promise<RadioStation[]> {
  const concurrency = Math.max(1, options.concurrency ?? 6)
  const timeoutMs = options.timeoutMs ?? 6_000
  const keep = stations.map((station) => !isKnownDeadRadioUrl(station.url))
  let next = 0

  async function probe(index: number): Promise<void> {
    const station = stations[index]
    if (!station || !keep[index] || !isQurangoRadioUrl(station.url)) return

    const result = await probeStreamWithAudio(station.url, timeoutMs)
    if (result === 'dead') keep[index] = false
  }

  async function worker(): Promise<void> {
    while (next < stations.length) {
      const index = next
      next += 1
      await probe(index)
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, stations.length) }, () => worker()),
  )

  return stations.filter((_, index) => keep[index])
}
