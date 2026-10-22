import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getAyahTafsir, getTafsirEditionForLanguage } from '@/lib/api/quran'
import { STALE_TIME_QURAN } from '@/lib/query/client'

export function ayahTafsirQueryKey(
  surahNumber: number,
  ayahNumber: number,
  edition: ReturnType<typeof getTafsirEditionForLanguage>,
) {
  return ['tafsir', 'ayah', surahNumber, ayahNumber, edition] as const
}

export function useAyahTafsir(surahNumber: number, ayahNumber: number, enabled = true) {
  const { i18n } = useTranslation()
  const edition = getTafsirEditionForLanguage(i18n.language)
  const isValidSurah = Number.isInteger(surahNumber) && surahNumber >= 1 && surahNumber <= 114
  const isValidAyah = Number.isInteger(ayahNumber) && ayahNumber >= 1

  return useQuery({
    queryKey: ayahTafsirQueryKey(surahNumber, ayahNumber, edition),
    queryFn: () => getAyahTafsir(surahNumber, ayahNumber, edition),
    enabled: enabled && isValidSurah && isValidAyah,
    staleTime: STALE_TIME_QURAN,
  })
}
