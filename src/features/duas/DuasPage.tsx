import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { getDuaCategories, type DuaCategory } from '@/lib/api/duas'
import { useDuasCategory } from '@/lib/hooks/useDuasCategory'
import { usePagination } from '@/lib/hooks/usePagination'
import { scrollWindowToTop } from '@/lib/utils/scroll'

import { PageShell } from '@/components/ui/PageShell'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'

import { ArabicText } from '@/components/content/ArabicText'

import { AttributionChip } from '@/components/content/AttributionChip'

import { AsyncState } from '@/components/ui/AsyncState'

import { Skeleton } from '@/components/ui/Skeleton'

const navButtonClass = 'normal-case tracking-normal'
const DUAS_PAGE_SIZE = 5

export function DuasPage() {
  const { t, i18n } = useTranslation()
  const { categoryId } = useParams<{ categoryId?: string }>()
  const [categories] = useState<DuaCategory[]>(getDuaCategories())
  const [selected, setSelected] = useState<string | null>(categoryId ?? null)
  const [readingIndex, setReadingIndex] = useState(0)
  const [readingMode, setReadingMode] = useState(false)
  const showEnglishNotice = i18n.language.split('-')[0] !== 'en'

  const categoryTitle = (category: DuaCategory) =>
    t(`pages.duas.categories.${category.id}`, { defaultValue: category.name })


  const {
    data: duas = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useDuasCategory(selected)

  const {
    paginatedItems: visibleDuas,
    page,
    totalPages,
    setPage,
    showPagination,
  } = usePagination(duas, DUAS_PAGE_SIZE, selected)

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selected) ?? null,
    [categories, selected],
  )

  useEffect(() => {
    if (categoryId && categories.some((c) => c.id === categoryId)) {
      setSelected(categoryId)
    }
  }, [categoryId, categories])

  useEffect(() => {
    setReadingIndex(0)
    setReadingMode(false)
  }, [selected])

  // In-page views (category / reading) keep the same /duas path — scroll manually.
  useEffect(() => {
    scrollWindowToTop()
  }, [selected, readingMode])

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : t('errors.generic')
    : !loading && selected && duas.length === 0
      ? t('pages.duas.emptyCategory')
      : null

  const handleBack = () => {
    setSelected(null)
    setReadingMode(false)
    setReadingIndex(0)
  }

  const enterReadingMode = () => {
    setReadingMode(true)
    setReadingIndex(0)
  }

  if (readingMode && duas.length > 0) {
    const dua = duas[readingIndex]

    return (
      <div className="min-h-[calc(100dvh-5rem)] md:min-h-dvh flex flex-col bg-surface-container-low dark:bg-dark-surface">
        <header className="sticky top-0 z-10 border-b border-hairline dark:border-dark-border bg-surface-container-low/95 dark:bg-dark-surface/95 backdrop-blur-md px-margin-mobile md:px-8 xl:px-margin-desktop py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReadingMode(false)}
              className={navButtonClass}
              aria-label={t('pages.duas.exitReadingMode')}
            >
              <span className="material-symbols-outlined text-lg" aria-hidden>
                close
              </span>
              {t('pages.duas.exitReadingMode')}
            </Button>

            <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
              {t('pages.duas.readingProgress', { current: readingIndex + 1, total: duas.length })}
            </p>
          </div>
          {showEnglishNotice ? (
            <p className="mt-2 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
              {t('pages.duas.contentEnglishOnly')}
            </p>
          ) : null}
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
          <ArabicText size="lg" className="mb-6 max-w-2xl text-primary dark:text-primary-fixed">
            {dua.arabic}
          </ArabicText>

          <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary italic mb-4 max-w-2xl">
            {dua.transliteration}
          </p>

          <p className="font-body-lg text-body-lg text-ink-soft dark:text-dark-text max-w-2xl leading-relaxed">
            {dua.translation}
          </p>

          <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mt-6">
            {dua.reference}
          </p>
        </div>

        <footer className="sticky bottom-0 pb-safe border-t border-hairline dark:border-dark-border bg-surface-container-low/95 dark:bg-dark-surface/95 backdrop-blur-md px-margin-mobile md:px-8 xl:px-margin-desktop py-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setReadingIndex(Math.max(0, readingIndex - 1))}
              disabled={readingIndex === 0}
              className={navButtonClass}
            >
              <span className="material-symbols-outlined text-lg rtl:rotate-180" aria-hidden>
                chevron_left
              </span>
              {t('common.previous')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setReadingIndex(Math.min(duas.length - 1, readingIndex + 1))}
              disabled={readingIndex === duas.length - 1}
              className={navButtonClass}
            >
              {t('common.next')}
              <span className="material-symbols-outlined text-lg rtl:rotate-180" aria-hidden>
                chevron_right
              </span>
            </Button>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <PageShell
      title={selectedCategory ? categoryTitle(selectedCategory) : t('pages.duas.title')}
      subtitle={
        selectedCategory
          ? selectedCategory.nameAr
          : t('pages.duas.subtitle')
      }
    >
      {showEnglishNotice ? (
        <p className="mb-4 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary rounded-lg border border-hairline dark:border-dark-border px-3 py-2">
          {t('pages.duas.contentEnglishOnly')}
        </p>
      ) : null}
      {!selected ? (
        <StaggerList className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <StaggerListItem key={cat.id}>
            <button type="button" onClick={() => setSelected(cat.id)} className="text-start w-full">
              <HoverCard className="p-6 h-full">
                <span className="material-symbols-outlined text-secondary mb-3 block text-2xl">{cat.icon}</span>
                <h3 className="font-medium text-ink-black dark:text-dark-text">{categoryTitle(cat)}</h3>
                <p dir="rtl" className="font-arabic-ui text-stone dark:text-dark-text-secondary text-sm mt-1">
                  {cat.nameAr}
                </p>
                <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mt-2">
                  {t('pages.duas.duaCount', { count: cat.count })}
                </p>
              </HoverCard>
            </button>
            </StaggerListItem>
          ))}
        </StaggerList>
      ) : (
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className={navButtonClass}
            >
              <span className="material-symbols-outlined text-lg rtl:rotate-180" aria-hidden>
                arrow_back
              </span>
              {t('pages.duas.allCategories')}
            </Button>

            {!loading && !error && duas.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={enterReadingMode}
                className={navButtonClass}
              >
                <span className="material-symbols-outlined text-lg" aria-hidden>
                  auto_stories
                </span>
                {t('pages.duas.readingMode')}
              </Button>
            )}
          </div>

          <AsyncState
            loading={loading}
            error={error}
            onRetry={() => void refetch()}
            loadingFallback={
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            }
            empty={!loading && !error && duas.length === 0}
            emptyFallback={
              <div className="flex flex-col items-center justify-center py-12 text-stone dark:text-dark-text-secondary">
                <span className="material-symbols-outlined text-4xl mb-3">inbox</span>
                <p className="font-body-md text-body-md">{t('pages.duas.emptyCategory')}</p>
              </div>
            }
          >
            <>
              <StaggerList key={page} className="space-y-4">
                {visibleDuas.map((dua, index) => {
                  const globalIndex = (page - 1) * DUAS_PAGE_SIZE + index

                  return (
                    <StaggerListItem key={dua.id}>
                    <HoverCard className="p-6 md:p-8">
                      <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mb-4">
                        {globalIndex + 1} / {duas.length}
                      </p>
                      <ArabicText className="mb-4 text-primary dark:text-primary-fixed">{dua.arabic}</ArabicText>
                      <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary italic mb-3">
                        {dua.transliteration}
                      </p>
                      <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text leading-relaxed">
                        {dua.translation}
                      </p>
                      <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mt-4 pt-4 border-t border-hairline dark:border-dark-border">
                        {dua.reference}
                      </p>
                    </HoverCard>
                    </StaggerListItem>
                  )
                })}
              </StaggerList>

              {showPagination && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </>
          </AsyncState>
        </div>
      )}

      <div className="mt-8">
        <AttributionChip
          source={t('pages.duas.source')}
          url="https://sunnah.com"
        />
      </div>
    </PageShell>
  )
}
