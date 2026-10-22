import { useQuery } from '@tanstack/react-query'

import { resolveLiveHlsSources } from '@/lib/api/aloulaLive'
import type { LiveTab } from '@/lib/liveStreams'

export function liveStreamQueryKey(tab: LiveTab) {
  return ['live', 'hls', tab] as const
}

export function useLiveStreamSources(tab: LiveTab) {
  return useQuery({
    queryKey: liveStreamQueryKey(tab),
    queryFn: ({ signal }) => resolveLiveHlsSources(tab, signal),
    staleTime: 1000 * 60 * 10,
  })
}
