import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getSurahTafsir, getTafsirEditionForLanguage } from '@/lib/api/quran'
import { STALE_TIME_QURAN } from '@/lib/query/client'

export function surahTafsirQueryKey(surahNumber: number, edition: ReturnType<typeof getTafsirEditionForLanguage>) {
  return ['tafsir', 'surah', surahNumber, edition] as const
}

export function useSurahTafsir(surahNumber: number, enabled = true) {
  const { i18n } = useTranslation()
  const edition = getTafsirEditionForLanguage(i18n.language)
  const isValidSurah = Number.isInteger(surahNumber) && surahNumber >= 1 && surahNumber <= 114
  const isBulkEdition = edition !== 'english_ibn_kathir'

  return useQuery({
    queryKey: surahTafsirQueryKey(surahNumber, edition),
    queryFn: () => getSurahTafsir(surahNumber, edition),
    enabled: enabled && isValidSurah && isBulkEdition,
    staleTime: STALE_TIME_QURAN,
  })
}
