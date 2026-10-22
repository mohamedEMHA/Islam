export interface GeocodeResult {
  city: string
  country: string
}

const NOMINATIM_EMAIL = 'contact@islam.house'
const cache = new Map<string, GeocodeResult>()
let lastRequestAt = 0
let requestChain: Promise<unknown> = Promise.resolve()

function cacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)}`
}

function waitForRateLimit(): Promise<void> {
  const run = async () => {
    const now = Date.now()
    const elapsed = now - lastRequestAt
    if (elapsed < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed))
    }
    lastRequestAt = Date.now()
  }
  const next = requestChain.then(run, run)
  requestChain = next
  return next
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
  const key = cacheKey(latitude, longitude)
  const cached = cache.get(key)
  if (cached) {
    return cached
  }

  await waitForRateLimit()

  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('format', 'json')
  url.searchParams.set('email', NOMINATIM_EMAIL)

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    const empty = { city: '', country: '' }
    cache.set(key, empty)
    return empty
  }

  const data = (await res.json()) as {
    address?: {
      city?: string
      town?: string
      village?: string
      municipality?: string
      county?: string
      country?: string
    }
  }

  const addr = data.address ?? {}
  const city = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.county ?? ''
  const country = addr.country ?? ''
  const result = { city, country }
  cache.set(key, result)
  return result
}
