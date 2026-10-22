import { useQuery } from '@tanstack/react-query'
import {
  getBookChapters,
  getBookHadiths,
  getCollectionBook,
  getCollectionBooks,
} from '@/lib/api/hadith'
import { STALE_TIME_CONTENT } from '@/lib/query/client'

export function hadithBooksQueryKey(collection: string) {
  return ['hadith', 'books', collection] as const
}

export function hadithBookMetaQueryKey(collection: string, bookNumber: string) {
  return ['hadith', 'bookMeta', collection, bookNumber] as const
}

export function hadithChaptersQueryKey(collection: string, bookNumber: string) {
  return ['hadith', 'chapters', collection, bookNumber] as const
}

export function hadithBookListQueryKey(collection: string, bookNumber: string) {
  return ['hadith', 'bookHadiths', collection, bookNumber] as const
}

export function useHadithBooks(collection: string | undefined) {
  return useQuery({
    queryKey: hadithBooksQueryKey(collection ?? ''),
    queryFn: () => getCollectionBooks(collection!),
    enabled: !!collection,
    staleTime: STALE_TIME_CONTENT,
  })
}

export function useHadithBookMeta(collection: string | undefined, bookNumber: string | undefined) {
  return useQuery({
    queryKey: hadithBookMetaQueryKey(collection ?? '', bookNumber ?? ''),
    queryFn: () => getCollectionBook(collection!, bookNumber!),
    enabled: !!collection && !!bookNumber,
    staleTime: STALE_TIME_CONTENT,
  })
}

export function useHadithChapters(collection: string | undefined, bookNumber: string | undefined) {
  return useQuery({
    queryKey: hadithChaptersQueryKey(collection ?? '', bookNumber ?? ''),
    queryFn: () => getBookChapters(collection!, bookNumber!),
    enabled: !!collection && !!bookNumber,
    staleTime: STALE_TIME_CONTENT,
    retry: 1,
  })
}

export function useHadithBookList(collection: string | undefined, bookNumber: string | undefined) {
  return useQuery({
    queryKey: hadithBookListQueryKey(collection ?? '', bookNumber ?? ''),
    // islamic.app rejects limit > 200 (400). Keep page size at 100 for stable pagination.
    queryFn: () => getBookHadiths(collection!, bookNumber!, { fetchAll: true, limit: 100 }),
    enabled: !!collection && !!bookNumber,
    staleTime: STALE_TIME_CONTENT,
  })
}
