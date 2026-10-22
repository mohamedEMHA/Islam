import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams } from 'react-router-dom'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useLocale } from '@/components/routing/LocalizedLink'
import { localizedPath } from '@/lib/i18n/localizedPath'
import {
  getTafsirEditionForLanguage,
  isTafsirEnglishFallback,
  TAFSIR_ATTRIBUTION,
} from '@/lib/api/quran'
import { useQuranList } from '@/lib/hooks/useQuranList'
import { useSurah } from '@/lib/hooks/useSurah'
import { useSurahTafsir } from '@/lib/hooks/useSurahTafsir'
import { useAyahTafsir } from '@/lib/hooks/useAyahTafsir'
import { LIST_PAGE_SIZE, usePagination } from '@/lib/hooks/usePagination'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { TafsirText } from '@/components/quran/TafsirText'
import { AttributionChip } from '@/components/content/AttributionChip'
import { HoverCard } from '@/components/motion/HoverCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { AsyncState } from '@/components/ui/AsyncState'
import { Pagination } from '@/components/ui/Pagination'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'

function AyahTafsirBlock({
  surahNumber,
  ayahNumber,
  bulkText,
}: {
  surahNumber: number
  ayahNumber: number
  bulkText?: string
}) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(Boolean(bulkText))
  const { data, isLoading, error } = useAyahTafsir(
    surahNumber,
    ayahNumber,
    visible && !bulkText,
  )

  useEffect(() => {
    if (bulkText || visible || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' },
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [bulkText, visible])

  const text = bulkText ?? data
  const showLoading = !bulkText && (isLoading || (!visible && !error))
  const showUnavailable = !bulkText && !isLoading && visible && (error || !text)

  return (
    <article ref={containerRef} className="font-body-md text-body-md text-ink-soft">
      {showLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ) : showUnavailable ? (
        <p className="text-stone italic">{t('pages.tafsir.unavailable')}</p>
      ) : text ? (
        <TafsirText text={text} />
      ) : null}
    </article>
  )
}

export function TafsirReaderPage() {
  const { t, i18n } = useTranslation()
  const locale = useLocale()
  const { surahId } = useParams<{ surahId: string }>()
  const translationEdition = useSettingsStore((state) => state.translationEdition)
  const num = Number(surahId)
  const isValidSurah = Number.isInteger(num) && num >= 1 && num <= 114
  const edition = getTafsirEditionForLanguage(i18n.language)
  const attribution = TAFSIR_ATTRIBUTION[edition]
  const isEnglishEdition = edition === 'english_ibn_kathir'

  const { data: surahList } = useQuranList()
  const {
    data: surahData,
    isLoading: surahLoading,
    error: surahError,
    refetch: refetchSurah,
  } = useSurah(num, 'uthmani', translationEdition, isValidSurah)
  const {
    data: bulkTafsir,
    isLoading: bulkLoading,
    error: bulkError,
    refetch: refetchBulk,
  } = useSurahTafsir(num, isValidSurah && !isEnglishEdition)

  const translation = surahData?.translation ?? []

  const {
    paginatedItems: visibleAyahs,
    page,
    totalPages,
    setPage,
    showPagination,
  } = usePagination(translation, LIST_PAGE_SIZE, isValidSurah ? num : 0)

  if (!isValidSurah) {
    return <Navigate to={localizedPath('/tafsir', locale)} replace />
  }

  const surahMeta = surahList?.find((surah) => surah.number === num) ?? null
  const arabic = surahData?.arabic ?? []
  const loading = surahLoading || (!isEnglishEdition && bulkLoading)
  const queryError = surahError ?? bulkError
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : t('errors.generic')
    : null

  const handleRetry = () => {
    void refetchSurah()
    if (!isEnglishEdition) {
      void refetchBulk()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-margin-mobile md:px-8 xl:px-margin-desktop py-8 md:py-10">
      <LocalizedLink
        to="/tafsir"
        className="text-stone hover:text-secondary font-label-sm text-label-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
        {t('pages.tafsir.title')}
      </LocalizedLink>

      <div className="mb-8">
        <p className="font-label-sm text-label-sm text-stone mb-2">
          {t('pages.tafsir.editionLabel')}: {t(attribution.labelKey)}
        </p>
        {isTafsirEnglishFallback(i18n.language) && i18n.language.split('-')[0] !== 'en' ? (
          <p className="font-label-sm text-label-sm text-stone mb-3">
            {t('pages.tafsir.fallbackEnglish')}
          </p>
        ) : null}
        <h1 className="font-heading-h2 text-heading-h2 text-ink-black">
          {surahMeta?.englishName ?? t('pages.tafsir.title')}
        </h1>
        {surahMeta && (
          <p dir="rtl" className="font-arabic-quran text-arabic-quran text-primary mt-2">
            {surahMeta.name}
          </p>
        )}
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={handleRetry}
        loadingFallback={
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        }
        empty={!loading && !error && translation.length === 0}
        emptyFallback={
          <HoverCard className="p-8 text-center">
            <p className="font-body-md text-body-md text-stone">{t('pages.tafsir.unavailable')}</p>
          </HoverCard>
        }
      >
        <StaggerList key={`${num}-${page}`} className="space-y-6">
          {visibleAyahs.map((ayah) => {
            const arabicAyah = arabic.find((item) => item.numberInSurah === ayah.numberInSurah)
            const bulkText = bulkTafsir?.[ayah.numberInSurah]

            return (
              <StaggerListItem key={ayah.numberInSurah}>
                <HoverCard className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-soft text-secondary font-label-sm text-label-sm">
                      {ayah.numberInSurah}
                    </span>
                    <span className="font-label-sm text-label-sm text-stone">
                      {t('pages.tafsir.ayahLabel', { number: ayah.numberInSurah })}
                    </span>
                  </div>

                  {arabicAyah?.text && (
                    <p
                      dir="rtl"
                      className="font-arabic-quran text-arabic-quran text-primary mb-4 leading-loose"
                    >
                      {arabicAyah.text}
                    </p>
                  )}

                  <p className="font-body-md text-body-md text-stone mb-5 leading-relaxed">
                    {ayah.text}
                  </p>

                  <AyahTafsirBlock
                    surahNumber={num}
                    ayahNumber={ayah.numberInSurah}
                    bulkText={bulkText}
                  />
                </HoverCard>
              </StaggerListItem>
            )
          })}
        </StaggerList>

        {showPagination && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </AsyncState>

      <div className="mt-8">
        <AttributionChip source={attribution.source} url={attribution.url} />
      </div>
    </div>
  )
}
