import { useQuery } from '@tanstack/react-query'
import { getSurah } from '@/lib/api/quran'
import type { QuranScript } from '@/types/quran'
import { STALE_TIME_QURAN } from '@/lib/query/client'

export function surahQueryKey(
  surahNumber: number,
  script: QuranScript,
  translationEdition: string,
) {
  return ['quran', 'surah', 'v2', surahNumber, script, translationEdition] as const
}

export function useSurah(
  surahNumber: number,
  script: QuranScript,
  translationEdition: string,
  enabled = true,
) {
  const isValidSurah = Number.isInteger(surahNumber) && surahNumber >= 1 && surahNumber <= 114

  return useQuery({
    queryKey: surahQueryKey(surahNumber, script, translationEdition),
    queryFn: ({ signal }) => getSurah(surahNumber, script, translationEdition, signal),
    enabled: enabled && isValidSurah,
    staleTime: STALE_TIME_QURAN,
  })
}
