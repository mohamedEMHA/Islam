import { apiFetch, ApiError } from '@/lib/api/client'
import {
  ALOULA_LIVE_SLUGS,
  HLS_SD_FALLBACKS,
  type LiveTab,
} from '@/lib/liveStreams'

/** Same-origin Vite proxy → https://aloula.faulio.com (Origin/Referer injected). */
const ALOULA_API_BASE = '/api/aloula'

interface AloulaChannel {
  id: number
  url: string
  has_live: boolean
}

interface AloulaPlayerResponse {
  streams?: { hls?: string | null }
  advertising?: unknown
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiFetch<T>(`${ALOULA_API_BASE}${path}`, {
    signal,
    source: 'aloula',
  })
}

export async function getAloulaChannelId(
  slug: 'quran' | 'sunna',
  signal?: AbortSignal,
): Promise<number> {
  const channels = await fetchJson<AloulaChannel[]>('/api/v1/channels', signal)
  const channel = channels.find((entry) => entry.url === slug)

  if (!channel) {
    throw new ApiError(`Aloula channel not found: ${slug}`, 404, 'aloula')
  }

  if (!channel.has_live) {
    throw new ApiError(`Aloula channel is not live: ${slug}`, 503, 'aloula')
  }

  return channel.id
}

export async function getAloulaLiveHlsUrl(
  slug: 'quran' | 'sunna',
  signal?: AbortSignal,
): Promise<string> {
  const channelId = await getAloulaChannelId(slug, signal)
  const player = await fetchJson<AloulaPlayerResponse>(
    `/api/v1.1/channels/${channelId}/player`,
    signal,
  )

  const hls = player.streams?.hls
  if (!hls) {
    throw new ApiError(`Aloula HLS missing for ${slug}`, 502, 'aloula')
  }

  return hls
}

/** HD Aloula first, Akamai SD last. Never empty. */
export async function resolveLiveHlsSources(
  tab: LiveTab,
  signal?: AbortSignal,
): Promise<string[]> {
  const fallback = HLS_SD_FALLBACKS[tab]

  try {
    const hls = await getAloulaLiveHlsUrl(ALOULA_LIVE_SLUGS[tab], signal)
    return hls === fallback ? [hls] : [hls, fallback]
  } catch {
    return [fallback]
  }
}
