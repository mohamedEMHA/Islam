import { useQuery } from '@tanstack/react-query'
import { getVerseTimings } from '@/lib/api/quran'
import { STALE_TIME_QURAN } from '@/lib/query/client'

export function verseTimingsQueryKey(surahNumber: number, reciterId: string) {
  return ['quran', 'verseTimings', surahNumber, reciterId] as const
}

export function useVerseTimings(surahNumber: number, reciterId: string, enabled = true) {
  const isValidSurah = Number.isInteger(surahNumber) && surahNumber >= 1 && surahNumber <= 114

  return useQuery({
    queryKey: verseTimingsQueryKey(surahNumber, reciterId),
    queryFn: ({ signal }) => getVerseTimings(surahNumber, reciterId, signal),
    enabled: enabled && isValidSurah && Boolean(reciterId),
    staleTime: STALE_TIME_QURAN,
  })
}
