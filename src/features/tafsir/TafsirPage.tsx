import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useQuranList } from '@/lib/hooks/useQuranList'
import { LIST_PAGE_SIZE, usePagination } from '@/lib/hooks/usePagination'
import { PageShell } from '@/components/ui/PageShell'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { AsyncState } from '@/components/ui/AsyncState'
import { Pagination } from '@/components/ui/Pagination'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { AttributionChip } from '@/components/content/AttributionChip'
import { getTafsirEditionForLanguage, isTafsirEnglishFallback, TAFSIR_ATTRIBUTION } from '@/lib/api/quran'

export function TafsirPage() {
  const { t, i18n } = useTranslation()
  const edition = getTafsirEditionForLanguage(i18n.language)
  const attribution = TAFSIR_ATTRIBUTION[edition]
  const showEnglishFallback = isTafsirEnglishFallback(i18n.language)
  const { data: surahs = [], isLoading: loading, error: queryError, refetch } = useQuranList()
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : t('errors.generic')
    : null
  const [search, setSearch] = useState('')

  const filtered = surahs.filter(
    (surah) =>
      surah.englishName.toLowerCase().includes(search.toLowerCase()) ||
      surah.name.includes(search) ||
      String(surah.number).includes(search),
  )

  const listResetKey = search

  const {
    paginatedItems: visibleSurahs,
    page,
    totalPages,
    setPage,
    showPagination,
    totalItems,
  } = usePagination(filtered, LIST_PAGE_SIZE, listResetKey)

  return (
    <PageShell title={t('pages.tafsir.title')} subtitle={t('pages.tafsir.subtitle')}>
      <div className="mb-6 p-4 rounded-xl border border-secondary/30 bg-green-soft/40 flex items-start gap-3">
        <span className="material-symbols-outlined text-secondary shrink-0">auto_stories</span>
        <div>
          <p className="font-medium text-ink-black">{t('pages.tafsir.editionLabel')}</p>
          <p className="font-body-md text-body-md text-stone mt-1">{t(attribution.labelKey)}</p>
          {showEnglishFallback && i18n.language.split('-')[0] !== 'en' ? (
            <p className="font-label-sm text-label-sm text-stone mt-2">
              {t('pages.tafsir.fallbackEnglish')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Input
          placeholder={t('pages.tafsir.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-lg w-full"
        />

        {!loading && !error && totalItems > 0 && (
          <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary tabular-nums shrink-0">
            {search.trim() ? `${totalItems} results` : `${totalItems} surahs`}
          </p>
        )}
      </div>

      <AsyncState
        loading={loading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        }
        empty={!loading && !error && filtered.length === 0}
        emptyFallback={
          <HoverCard className="p-8 text-center">
            <p className="font-body-md text-body-md text-stone">{t('pages.tafsir.noResults')}</p>
          </HoverCard>
        }
      >
        <StaggerList key={listResetKey + page} className="grid gap-2">
          {visibleSurahs.map((surah) => (
            <StaggerListItem key={surah.number}>
            <LocalizedLink to={`/tafsir/${surah.number}`}>
              <HoverCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 min-w-0">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-green-soft text-secondary font-label-sm text-label-sm rounded-lg">
                    {String(surah.number).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink-black truncate">{surah.englishName}</p>
                    <p className="font-body-md text-body-md text-stone truncate">
                      {surah.englishNameTranslation} · {surah.numberOfAyahs} {t('pages.tafsir.verses')}
                    </p>
                  </div>
                </div>
                <p dir="rtl" className="font-arabic-quran text-arabic-quran text-primary shrink-0 sm:text-end truncate">
                  {surah.name}
                </p>
              </HoverCard>
            </LocalizedLink>
            </StaggerListItem>
          ))}
        </StaggerList>

        {showPagination && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </AsyncState>

      <div className="mt-8">
        <AttributionChip source={attribution.source} url={attribution.url} />
      </div>
    </PageShell>
  )
}
