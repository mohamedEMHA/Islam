import { useQuery } from '@tanstack/react-query'
import { getHadith } from '@/lib/api/hadith'
import { STALE_TIME_CONTENT } from '@/lib/query/client'

export function hadithQueryKey(collection: string, id: string, bookNumber?: string) {
  return ['hadith', collection, id, bookNumber ?? ''] as const
}

export function useHadithCollection(
  collection: string | undefined,
  id: string | undefined,
  bookNumber?: string,
) {
  const isValid = !!collection && !!id

  return useQuery({
    queryKey: hadithQueryKey(collection ?? '', id ?? '', bookNumber),
    queryFn: ({ signal }) => getHadith(collection!, id!, bookNumber, signal),
    enabled: isValid,
    staleTime: STALE_TIME_CONTENT,
  })
}
