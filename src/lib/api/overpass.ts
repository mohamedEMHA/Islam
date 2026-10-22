import { sortByDistance } from '@/lib/utils/haversine'

export interface Mosque {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  osmType: 'node' | 'way' | 'relation'
  osmId: number
  distanceMeters: number
}

export const DEFAULT_RADIUS_M = 5000
export const CACHE_TTL_MS = 5 * 60 * 1000

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
] as const

const CACHE_PREFIX = 'mosque_finder:'

interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

export class OverpassError extends Error {
  readonly code: 'timeout' | 'network' | 'parse' | 'empty'

  constructor(message: string, code: 'timeout' | 'network' | 'parse' | 'empty') {
    super(message)
    this.name = 'OverpassError'
    this.code = code
  }
}

export function buildMosqueQuery(lat: number, lng: number, radiusM: number): string {
  const radius = Math.max(100, Math.round(radiusM))
  return `[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
);
out center tags;`
}

function cacheKey(lat: number, lng: number, radiusM: number): string {
  return `${CACHE_PREFIX}${lat.toFixed(4)}:${lng.toFixed(4)}:${radiusM}`
}

function readCache(key: string): Mosque[] | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { expiresAt: number; mosques: Mosque[] }
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(key)
      return null
    }
    return parsed.mosques
  } catch {
    return null
  }
}

function writeCache(key: string, mosques: Mosque[]): void {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({ expiresAt: Date.now() + CACHE_TTL_MS, mosques }),
    )
  } catch {
    // sessionStorage full or unavailable
  }
}

function buildAddress(tags: Record<string, string>): string | undefined {
  if (tags['addr:full']) return tags['addr:full']
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'] ?? tags['addr:town'] ?? tags['addr:village'],
    tags['addr:postcode'],
    tags['addr:country'],
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : undefined
}

const OSM_TYPES = new Set(['node', 'way', 'relation'])

function isOsmType(value: string): value is Mosque['osmType'] {
  return OSM_TYPES.has(value)
}

function elementCoords(element: OverpassElement): { lat: number; lon: number } | null {
  if (element.type === 'node' && element.lat != null && element.lon != null) {
    if (!Number.isFinite(element.lat) || !Number.isFinite(element.lon)) return null
    return { lat: element.lat, lon: element.lon }
  }
  if (element.center) {
    if (!Number.isFinite(element.center.lat) || !Number.isFinite(element.center.lon)) {
      return null
    }
    return { lat: element.center.lat, lon: element.center.lon }
  }
  return null
}

export function parseOverpassElements(
  elements: OverpassElement[],
  originLat: number,
  originLng: number,
): Mosque[] {
  const mosques: Omit<Mosque, 'distanceMeters'>[] = []

  for (const element of elements) {
    if (!isOsmType(element.type) || !Number.isFinite(element.id)) continue

    const coords = elementCoords(element)
    if (!coords) continue

    const tags = element.tags ?? {}
    const name =
      tags.name ??
      tags['name:en'] ??
      tags['name:ar'] ??
      tags['name:fr'] ??
      'Mosque'

    mosques.push({
      id: `${element.type}/${element.id}`,
      name,
      latitude: coords.lat,
      longitude: coords.lon,
      address: buildAddress(tags),
      osmType: element.type,
      osmId: element.id,
    })
  }

  return sortByDistance(mosques, originLat, originLng)
}

export function getOsmUrl(mosque: Pick<Mosque, 'osmType' | 'osmId'>): string {
  return `https://www.openstreetmap.org/${mosque.osmType}/${mosque.osmId}`
}

export function getDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
}

async function fetchFromEndpoint(
  endpoint: string,
  query: string,
  signal?: AbortSignal,
): Promise<OverpassResponse> {
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => timeoutController.abort(), 30_000)
  const merged = signal
    ? AbortSignal.any
      ? AbortSignal.any([signal, timeoutController.signal])
      : timeoutController.signal
    : timeoutController.signal

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: merged,
    })

    if (!response.ok) {
      if (response.status === 429 || response.status === 504) {
        throw new OverpassError('Overpass API is busy. Please try again shortly.', 'timeout')
      }
      throw new OverpassError(`Overpass request failed: ${response.statusText}`, 'network')
    }

    try {
      return (await response.json()) as OverpassResponse
    } catch {
      throw new OverpassError('Failed to parse Overpass response', 'parse')
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchNearbyMosques(
  lat: number,
  lng: number,
  radiusM: number = DEFAULT_RADIUS_M,
  options?: { signal?: AbortSignal; skipCache?: boolean },
): Promise<Mosque[]> {
  const key = cacheKey(lat, lng, radiusM)

  if (!options?.skipCache) {
    const cached = readCache(key)
    if (cached) return cached
  }

  const query = buildMosqueQuery(lat, lng, radiusM)
  let lastError: Error | null = null

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const data = await fetchFromEndpoint(endpoint, query, options?.signal)
      const mosques = parseOverpassElements(data.elements ?? [], lat, lng)
      writeCache(key, mosques)
      return mosques
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }
      lastError = error instanceof Error ? error : new Error('Overpass fetch failed')
    }
  }

  if (lastError instanceof OverpassError) {
    throw lastError
  }

  throw new OverpassError(
    lastError?.message ?? 'Unable to reach Overpass API',
    'network',
  )
}
