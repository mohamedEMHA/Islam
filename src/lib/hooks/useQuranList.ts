import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getSurahList } from '@/lib/api/quran'
import { STALE_TIME_QURAN } from '@/lib/query/client'

export function quranListQueryKey(language: string) {
  return ['quran', 'list', language.split('-')[0].toLowerCase()] as const
}

export function useQuranList() {
  const { i18n } = useTranslation()
  const language = i18n.language

  return useQuery({
    queryKey: quranListQueryKey(language),
    queryFn: () => getSurahList(language),
    staleTime: STALE_TIME_QURAN,
  })
}
