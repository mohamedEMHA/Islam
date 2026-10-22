import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { LocalizedLink } from '@/components/routing/LocalizedLink'

import { useQuranList } from '@/lib/hooks/useQuranList'
import { LIST_PAGE_SIZE, usePagination } from '@/lib/hooks/usePagination'

import { JUZ_STARTS, JUZ_COUNT, getSurahsForJuz } from '@/lib/data/juzMapping'

import { PageShell } from '@/components/ui/PageShell'

import { TabPills } from '@/components/ui/TabPills'

import { Input } from '@/components/ui/Input'

import { ListRowSkeleton } from '@/components/ui/Skeleton'

import { AsyncState } from '@/components/ui/AsyncState'

import { Pagination } from '@/components/ui/Pagination'

import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { TabFade } from '@/components/motion/TabFade'

import { AttributionChip } from '@/components/content/AttributionChip'

import { cn } from '@/lib/utils/format'



export function QuranListPage() {

  const { t } = useTranslation()

  const { data: surahs = [], isLoading: loading, error: queryError, refetch } = useQuranList()
  const error = queryError ? (queryError instanceof Error ? queryError.message : t('errors.generic')) : null

  const [search, setSearch] = useState('')

  const [tab, setTab] = useState<'surah' | 'juz' | 'revelation'>('surah')

  const [selectedJuz, setSelectedJuz] = useState<number | null>(null)

  const handleTabChange = (next: 'surah' | 'juz' | 'revelation') => {

    setTab(next)

    if (next !== 'juz') {

      setSelectedJuz(null)

    }

  }



  const filtered = surahs.filter(

    (s) =>

      s.englishName.toLowerCase().includes(search.toLowerCase()) ||

      s.name.includes(search) ||

      String(s.number).includes(search),

  )



  const juzFiltered =

    selectedJuz !== null

      ? filtered.filter((s) => {

          const { start, end } = getSurahsForJuz(selectedJuz)

          return s.number >= start && s.number <= end

        })

      : filtered



  const sorted =

    tab === 'revelation'

      ? [...juzFiltered].sort((a, b) =>

          a.revelationType === b.revelationType

            ? a.number - b.number

            : a.revelationType === 'Meccan'

              ? -1

              : 1,

        )

      : juzFiltered



  const selectedJuzMeta = selectedJuz ? JUZ_STARTS[selectedJuz - 1] : null

  const selectedRange = selectedJuz ? getSurahsForJuz(selectedJuz) : null

  const listResetKey = `${tab}:${search}:${selectedJuz ?? 'all'}`

  const {
    paginatedItems: visibleSurahs,
    page,
    totalPages,
    setPage,
    showPagination,
    totalItems,
  } = usePagination(sorted, LIST_PAGE_SIZE, listResetKey)

  const showSurahList = tab !== 'juz' || selectedJuz !== null



  return (

    <PageShell

      title={t('pages.quran.title')}

      subtitle={t('pages.quran.subtitle')}

    >

      <TabPills

        tabs={[

          { id: 'surah', label: t('pages.quran.tabs.surah') },

          { id: 'juz', label: t('pages.quran.tabs.juz') },

          { id: 'revelation', label: t('pages.quran.tabs.revelation') },

        ]}

        active={tab}

        onChange={handleTabChange}

        className="mb-6"

      />

      <TabFade activeKey={`${tab}:${selectedJuz ?? 'all'}`}>

      {tab === 'juz' && selectedJuz === null ? (

        <StaggerList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-8 auto-rows-fr">

          {Array.from({ length: JUZ_COUNT }, (_, i) => i + 1).map((juz) => {

            const meta = JUZ_STARTS[juz - 1]

            const range = getSurahsForJuz(juz)

            const surahRangeLabel =

              range.end !== range.start

                ? t('pages.quran.surahRange', { start: range.start, end: range.end })

                : t('pages.quran.surahSingle', { number: range.start })

            return (

              <StaggerListItem key={juz} className="h-full min-h-0">

              <button

                type="button"

                onClick={() => setSelectedJuz(juz)}

                className="text-start w-full h-full"

              >

                <HoverCard className="flex h-full min-h-[6.75rem] flex-col p-4 sm:p-5 transition-colors hover:border-secondary/40 dark:border-dark-border dark:bg-dark-surface">

                  <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mb-2 tabular-nums">

                    {t('pages.quran.juzLabel', { number: juz })}

                  </p>

                  <p className="font-medium text-ink-black dark:text-dark-text line-clamp-2 flex-1 leading-snug mb-2">

                    {meta?.name ?? t('pages.quran.juzPartFallback', { number: juz })}

                  </p>

                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary mt-auto tabular-nums">

                    {surahRangeLabel}

                  </p>

                </HoverCard>

              </button>

              </StaggerListItem>

            )

          })}

        </StaggerList>

      ) : showSurahList ? (

        <div>

          {tab === 'juz' && selectedJuz !== null && (

            <div className="mb-6 flex items-center gap-3">

              <button

                type="button"

                onClick={() => setSelectedJuz(null)}

                className="inline-flex items-center gap-1 font-label-sm text-label-sm text-stone hover:text-secondary transition-colors"

              >

                <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>

                {t('pages.quran.allJuz')}

              </button>

              <span className="text-hairline">|</span>

              <p className="font-label-sm text-label-sm text-ink-soft">

                {t('pages.quran.juzHeader', { juz: selectedJuz, name: selectedJuzMeta?.name ?? '' })}

                {selectedRange &&
                  (selectedRange.end !== selectedRange.start
                    ? ` · ${t('pages.quran.surahRange', { start: selectedRange.start, end: selectedRange.end })}`
                    : ` · ${t('pages.quran.surahSingle', { number: selectedRange.start })}`)}

              </p>

            </div>

          )}



          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Input

              placeholder={tab === 'juz' ? t('pages.quran.searchInJuz') : t('pages.quran.searchSurah')}

              value={search}

              onChange={(e) => setSearch(e.target.value)}

              className="max-w-lg w-full"

            />

            {!loading && !error && totalItems > 0 && (
              <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary tabular-nums shrink-0">
                {search.trim()
                  ? t('pages.quran.resultsCount', { count: totalItems })
                  : t('pages.quran.surahCount', { count: totalItems })}
              </p>
            )}
          </div>

          <AsyncState

            loading={loading}

            error={error}

            onRetry={() => void refetch()}

            loadingFallback={

              <div className="space-y-3">

                {Array.from({ length: 8 }).map((_, i) => (

                  <ListRowSkeleton key={i} />

                ))}

              </div>

            }

            empty={!loading && !error && sorted.length === 0}

            emptyFallback={

              <HoverCard className="p-8 text-center">

                <p className="font-body-md text-body-md text-stone">{t('pages.quran.noResults')}</p>

              </HoverCard>

            }

          >

            <StaggerList key={listResetKey + page} className="grid gap-2">

              {visibleSurahs.map((surah) => (

                <StaggerListItem key={surah.number}>

                <LocalizedLink to={`/quran/${surah.number}`}>

                  <HoverCard className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 min-w-0')}>

                    <div className="flex items-center gap-4 min-w-0">

                      <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-green-soft text-secondary font-label-sm text-label-sm rounded-lg">

                        {String(surah.number).padStart(2, '0')}

                      </span>

                      <div className="min-w-0">

                        <p className="font-medium text-ink-black truncate">{surah.englishName}</p>

                        <p className="font-body-md text-body-md text-stone truncate">

                          {surah.englishNameTranslation} · {t('pages.quran.versesCount', { count: surah.numberOfAyahs })}

                        </p>

                      </div>

                    </div>

                    <p dir="rtl" className="font-arabic-quran text-arabic-quran text-primary shrink-0 sm:text-end truncate">{surah.name}</p>

                  </HoverCard>

                </LocalizedLink>

                </StaggerListItem>

              ))}

            </StaggerList>

            {showPagination && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}

          </AsyncState>

        </div>

      ) : null}

      </TabFade>

      <div className="mt-8">

        <AttributionChip source="Quran.com API" url="https://quran.com" />

      </div>

    </PageShell>

  )

}

