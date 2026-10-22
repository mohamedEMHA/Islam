import { useQuery } from '@tanstack/react-query'
import { getSurahAyahMetadata } from '@/lib/api/aladhan'
import { STALE_TIME_QURAN } from '@/lib/query/client'

export function surahMetadataQueryKey(surahNumber: number) {
  return ['quran', 'metadata', surahNumber] as const
}

export function useSurahMetadata(surahNumber: number, enabled = true) {
  const isValidSurah = Number.isInteger(surahNumber) && surahNumber >= 1 && surahNumber <= 114

  return useQuery({
    queryKey: surahMetadataQueryKey(surahNumber),
    queryFn: () => getSurahAyahMetadata(surahNumber),
    enabled: enabled && isValidSurah,
    staleTime: STALE_TIME_QURAN,
  })
}
