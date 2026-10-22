import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { TabPills } from '@/components/ui/TabPills'
import { HoverCard } from '@/components/motion/HoverCard'
import { Input } from '@/components/ui/Input'
import { AsyncState } from '@/components/ui/AsyncState'
import { Skeleton } from '@/components/ui/Skeleton'
import { AttributionChip } from '@/components/content/AttributionChip'
import { TabFade } from '@/components/motion/TabFade'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { filterBabyNames, type IslamicName } from '@/lib/api/ummah'
import { useBabyNames, type BabyNamesGenderFilter } from '@/lib/hooks/useBabyNames'
import { LIST_PAGE_SIZE, usePagination } from '@/lib/hooks/usePagination'
import { Pagination } from '@/components/ui/Pagination'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function NameDetail({
  name,
  onBack,
}: {
  name: IslamicName
  onBack: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="px-margin-mobile md:px-8 xl:px-margin-desktop py-8 md:py-10 max-w-2xl mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="font-label-sm text-label-sm text-secondary mb-8 hover:underline"
      >
        {t('pages.babyNames.backToAll')}
      </button>

      <HoverCard className="p-8">
        <p dir="rtl" className="font-arabic-ui text-4xl text-primary mb-4">
          {name.arabic}
        </p>
        <p className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-on-surface mb-2">
          {name.name}
        </p>
        <p className="font-body-lg text-body-lg text-ink-soft leading-relaxed mb-6">{name.meaning}</p>

        <dl className="space-y-4">
          <div>
            <dt className="font-label-sm text-label-sm text-stone">{t('pages.babyNames.gender')}</dt>
            <dd className="font-body-md text-body-md text-ink-black dark:text-dark-on-surface mt-1">
              {t(`pages.babyNames.genders.${name.gender}`)}
            </dd>
          </div>
          <div>
            <dt className="font-label-sm text-label-sm text-stone">{t('pages.babyNames.origin')}</dt>
            <dd className="font-body-md text-body-md text-ink-black dark:text-dark-on-surface mt-1">
              {name.origin}
            </dd>
          </div>
          {name.root && (
            <div>
              <dt className="font-label-sm text-label-sm text-stone">{t('pages.babyNames.root')}</dt>
              <dd dir="rtl" className="font-arabic-ui text-xl text-primary mt-1">
                {name.root}
              </dd>
            </div>
          )}
          {name.note && (
            <div>
              <dt className="font-label-sm text-label-sm text-stone">{t('pages.babyNames.note')}</dt>
              <dd className="font-body-md text-body-md text-ink-soft mt-1 leading-relaxed">{name.note}</dd>
            </div>
          )}
        </dl>
      </HoverCard>
    </div>
  )
}

export function BabyNamesPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState<BabyNamesGenderFilter>('all')
  const [letter, setLetter] = useState<string | null>(null)
  const [selected, setSelected] = useState<IslamicName | null>(null)

  const { data: names = [], isLoading, error, refetch } = useBabyNames(gender)

  const filtered = useMemo(
    () => filterBabyNames(names, search, letter),
    [names, search, letter],
  )

  const listResetKey = `${gender}:${search}:${letter ?? 'all'}`

  const {
    paginatedItems: visibleNames,
    page,
    totalPages,
    setPage,
    showPagination,
  } = usePagination(filtered, LIST_PAGE_SIZE, listResetKey)

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : t('errors.generic')
    : null

  if (selected) {
    return <NameDetail name={selected} onBack={() => setSelected(null)} />
  }

  return (
    <PageShell title={t('pages.babyNames.title')} subtitle={t('pages.babyNames.subtitle')}>
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder={t('pages.babyNames.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <TabPills
          tabs={[
            { id: 'all', label: t('pages.babyNames.filters.all') },
            { id: 'male', label: t('pages.babyNames.filters.boy') },
            { id: 'female', label: t('pages.babyNames.filters.girl') },
          ]}
          active={gender}
          onChange={(value) => {
            setGender(value as BabyNamesGenderFilter)
            setLetter(null)
          }}
        />
      </div>

      <TabFade activeKey={`${gender}:${letter ?? 'all'}`}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setLetter(null)}
          className={`inline-flex min-w-11 min-h-11 items-center justify-center rounded-full font-label-sm text-label-sm ${
            !letter
              ? 'bg-green-soft text-secondary dark:bg-dark-surface-container-high'
              : 'text-stone hover:bg-cream-deep dark:hover:bg-dark-surface-container'
          }`}
        >
          *
        </button>
        {LETTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setLetter(value)}
            className={`inline-flex min-w-11 min-h-11 items-center justify-center rounded-full font-label-sm text-label-sm ${
              letter === value
                ? 'bg-green-soft text-secondary dark:bg-dark-surface-container-high'
                : 'text-stone hover:bg-cream-deep dark:hover:bg-dark-surface-container'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {!isLoading && !errorMessage && (
        <p className="font-label-sm text-label-sm text-stone mb-6">
          {t('pages.babyNames.count', { count: filtered.length })}
        </p>
      )}

      <AsyncState
        loading={isLoading}
        error={errorMessage}
        empty={!isLoading && !errorMessage && filtered.length === 0}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-xl" />
            ))}
          </div>
        }
        emptyFallback={
          <div className="flex flex-col items-center justify-center py-12 text-stone">
            <span className="material-symbols-outlined text-4xl mb-3">search_off</span>
            <p className="font-body-md text-body-md">{t('pages.babyNames.noResults')}</p>
          </div>
        }
      >
        <StaggerList key={listResetKey + page} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleNames.map((name) => (
            <StaggerListItem key={name.id}>
            <button
              type="button"
              onClick={() => setSelected(name)}
              className="text-start w-full"
            >
              <HoverCard className="p-5 h-full">
                <p dir="rtl" className="font-arabic-ui text-2xl text-primary mb-2">
                  {name.arabic}
                </p>
                <p className="font-medium text-ink-black dark:text-dark-on-surface">{name.name}</p>
                <p className="font-body-md text-body-md text-ink-soft mt-1 line-clamp-2">
                  {name.meaning}
                </p>
                <p className="font-label-sm text-label-sm text-stone mt-2">
                  {t(`pages.babyNames.genders.${name.gender}`)}
                </p>
              </HoverCard>
            </button>
            </StaggerListItem>
          ))}
        </StaggerList>

        {showPagination && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </AsyncState>
      </TabFade>

      <div className="mt-8">
        <AttributionChip source="UmmahAPI" url="https://ummahapi.com" />
      </div>
    </PageShell>
  )
}
