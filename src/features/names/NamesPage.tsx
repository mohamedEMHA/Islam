import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { getAsmaAlHusna, type AsmaName } from '@/lib/api/aladhan'

import { LIST_PAGE_SIZE, usePagination } from '@/lib/hooks/usePagination'

import { PageShell } from '@/components/ui/PageShell'

import { Pagination } from '@/components/ui/Pagination'

import { HoverCard } from '@/components/motion/HoverCard'

import { ArabicText } from '@/components/content/ArabicText'

import { Skeleton } from '@/components/ui/Skeleton'

import { AttributionChip } from '@/components/content/AttributionChip'

import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'

import { AsyncState } from '@/components/ui/AsyncState'



export function NamesPage() {

  const { t } = useTranslation()

  const [names, setNames] = useState<AsmaName[]>([])

  const [selected, setSelected] = useState<AsmaName | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)



  const loadNames = useCallback(() => {

    setLoading(true)

    setError(null)

    getAsmaAlHusna()

      .then(setNames)

      .catch((err) => {

        setNames([])

        setError(err instanceof Error ? err.message : t('pages.names.loadError'))

      })

      .finally(() => setLoading(false))

  }, [t])



  useEffect(() => {

    loadNames()

  }, [loadNames])



  const {

    paginatedItems: visibleNames,

    page,

    totalPages,

    setPage,

    showPagination,

  } = usePagination(names, LIST_PAGE_SIZE, 'all')



  if (selected) {

    return (

      <div className="px-margin-mobile md:px-8 xl:px-margin-desktop py-8 md:py-10 max-w-lg mx-auto text-center">

        <button

          type="button"

          onClick={() => setSelected(null)}

          className="font-label-sm text-label-sm text-secondary mb-8 hover:underline"

        >

          {t('pages.names.backToAll')}

        </button>

        <p className="font-label-sm text-label-sm text-stone mb-2">#{selected.number}</p>

        <ArabicText size="lg" className="mb-4 text-primary">{selected.name}</ArabicText>

        <p className="font-heading-h3 text-heading-h3 text-ink-black mb-2">{selected.transliteration}</p>

        <p className="font-body-lg text-body-lg text-ink-soft leading-relaxed">{selected.en.meaning}</p>

      </div>

    )

  }



  return (

    <PageShell

      title={t('pages.names.title')}

      subtitle={t('pages.names.subtitle')}

    >

      <AsyncState

        loading={loading}

        error={error}

        onRetry={loadNames}

        loadingFallback={

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" aria-busy="true">

            {Array.from({ length: 12 }).map((_, i) => (

              <div

                key={i}

                className="rounded-xl border border-hairline dark:border-dark-border bg-paper-white dark:bg-dark-surface p-5 space-y-3"

              >

                <Skeleton className="h-3 w-8 rounded" />

                <Skeleton className="h-8 w-20 rounded-lg" />

                <Skeleton className="h-4 w-28 rounded" />

              </div>

            ))}

          </div>

        }

      >

        <StaggerList key={page} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {visibleNames.map((name) => (

            <StaggerListItem key={name.number}>

              <button type="button" onClick={() => setSelected(name)} className="text-start w-full">

                <HoverCard className="p-5 h-full">

                  <span className="font-label-sm text-label-sm text-stone">{String(name.number).padStart(2, '0')}</span>

                  <p dir="rtl" className="font-arabic-quran text-base md:text-arabic-quran text-primary my-2">{name.name}</p>

                  <p className="font-body-md text-body-md text-ink-soft">{name.transliteration}</p>

                </HoverCard>

              </button>

            </StaggerListItem>

          ))}

        </StaggerList>



        {showPagination && (

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        )}

      </AsyncState>

      <div className="mt-8">

        <AttributionChip source="AlAdhan API" url="https://aladhan.com/prayer-times-api" />

      </div>

    </PageShell>

  )

}

