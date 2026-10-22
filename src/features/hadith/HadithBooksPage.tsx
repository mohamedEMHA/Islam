import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { LocalizedLink, useLocale } from '@/components/routing/LocalizedLink'
import { localizedPath } from '@/lib/i18n/localizedPath'
import {
  HADITH_COLLECTIONS,
  isHadithCollection,
  getHadithProviderLabel,
} from '@/lib/api/hadith'
import { useHadithBooks } from '@/lib/hooks/useHadithBooks'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { Skeleton } from '@/components/ui/Skeleton'
import { AsyncState } from '@/components/ui/AsyncState'
import { AttributionChip } from '@/components/content/AttributionChip'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'
import type { HadithBook } from '@/types/hadith'
import { scrollWindowToTop } from '@/lib/utils/scroll'

const BOOKS_PER_PAGE = 20

function sortBooks(books: HadithBook[]): HadithBook[] {
  return [...books].sort((a, b) => {
    const aNum = Number.parseInt(a.bookNumber, 10)
    const bNum = Number.parseInt(b.bookNumber, 10)
    const aOk = Number.isFinite(aNum)
    const bOk = Number.isFinite(bNum)
    if (aOk && bOk) return aNum - bNum
    if (aOk) return -1
    if (bOk) return 1
    return a.bookNumber.localeCompare(b.bookNumber)
  })
}

function bookNumberLabel(book: HadithBook, fallback: (n: string) => string): string {
  const numeric = Number.parseInt(book.bookNumber, 10)
  if (Number.isFinite(numeric) && String(numeric) === book.bookNumber.trim()) {
    return fallback(book.bookNumber)
  }
  return book.nameEn || book.bookNumber
}

export function HadithBooksPage() {
  const { t } = useTranslation()
  const { formatInteger } = useLocaleFormat()
  const locale = useLocale()
  const { collection } = useParams<{ collection: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const isValidCollection = isHadithCollection(collection)
  const collectionMeta = HADITH_COLLECTIONS.find((c) => c.id === collection)

  const { data: books, isLoading, isError, error, refetch } = useHadithBooks(
    isValidCollection ? collection : undefined,
  )

  const sortedBooks = useMemo(() => (books ? sortBooks(books) : []), [books])

  const totalPages = Math.max(1, Math.ceil(sortedBooks.length / BOOKS_PER_PAGE))
  const rawPage = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1
    ? Math.min(rawPage, totalPages)
    : 1

  useEffect(() => {
    if (!books || books.length === 0) return
    const param = searchParams.get('page')
    if (!param) return
    const parsed = Number.parseInt(param, 10)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > totalPages || parsed !== currentPage) {
      const next = new URLSearchParams(searchParams)
      if (currentPage <= 1) next.delete('page')
      else next.set('page', String(currentPage))
      setSearchParams(next, { replace: true, preventScrollReset: true })
    }
  }, [books, currentPage, searchParams, setSearchParams, totalPages])

  const pageBooks = useMemo(() => {
    const start = (currentPage - 1) * BOOKS_PER_PAGE
    return sortedBooks.slice(start, start + BOOKS_PER_PAGE)
  }, [sortedBooks, currentPage])

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page <= 1) next.delete('page')
    else next.set('page', String(page))
    setSearchParams(next, { replace: true, preventScrollReset: true })
    scrollWindowToTop()
  }

  if (!isValidCollection || !collectionMeta) {
    return <Navigate to={localizedPath('/hadith', locale)} replace />
  }

  if (collectionMeta.fortyBookNumber) {
    return (
      <Navigate
        to={localizedPath(`/hadith/${collection}/books/${collectionMeta.fortyBookNumber}`, locale)}
        replace
      />
    )
  }

  const pageTitle = collectionMeta.name
  const subtitle = books
    ? t('hadithReader.booksCount', { count: books.length })
    : t('hadithReader.booksSubtitle')

  if (isLoading) {
    return (
      <PageShell title={pageTitle} subtitle={t('hadithReader.booksSubtitle')}>
        <div className="grid gap-2 lg:grid-cols-2" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </PageShell>
    )
  }

  if (isError || !books) {
    return (
      <PageShell title={pageTitle} subtitle={t('hadithReader.booksSubtitle')}>
        <AsyncState
          error={error instanceof Error ? error.message : t('errors.generic')}
          onRetry={() => void refetch()}
        />
      </PageShell>
    )
  }

  if (sortedBooks.length === 0) {
    return (
      <PageShell title={pageTitle} subtitle={t('hadithReader.booksSubtitle')}>
        <HoverCard className="p-8 text-center dark:bg-dark-surface dark:border-dark-border">
          <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
            {t('hadithReader.noBooks')}
          </p>
        </HoverCard>
      </PageShell>
    )
  }

  const showPagination = totalPages > 1

  return (
    <PageShell title={pageTitle} subtitle={subtitle} className="max-w-full overflow-x-clip">
      <LocalizedLink
        to="/hadith"
        className="text-stone hover:text-secondary dark:text-dark-text-secondary dark:hover:text-dark-green font-label-sm text-label-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
        {t('hadithReader.backToCollections')}
      </LocalizedLink>

      <StaggerList className="grid min-w-0 gap-2 lg:grid-cols-2">
        {pageBooks.map((book) => {
          const isNumericBook = Number.isFinite(Number.parseInt(book.bookNumber, 10)) &&
            String(Number.parseInt(book.bookNumber, 10)) === book.bookNumber.trim()
          const preferArabic = locale === 'ar' && Boolean(book.nameAr)
          const primaryTitle = preferArabic ? book.nameAr! : book.nameEn
          const secondaryTitle = preferArabic ? book.nameEn : book.nameAr

          return (
            <StaggerListItem key={book.bookNumber} className="min-w-0">
              <LocalizedLink
                to={`/hadith/${collection}/books/${book.bookNumber}`}
                className="block h-full min-w-0 max-w-full"
              >
                <HoverCard className="h-full min-w-0 overflow-hidden px-4 py-3.5 dark:bg-dark-surface dark:border-dark-border">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-soft font-label-sm text-label-sm text-secondary dark:bg-dark-green/20 dark:text-dark-green">
                      {isNumericBook ? book.bookNumber : '·'}
                    </span>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h3
                        className="font-body-lg text-body-lg leading-snug text-ink-black dark:text-dark-text truncate"
                        dir={preferArabic ? 'rtl' : undefined}
                      >
                        {primaryTitle}
                      </h3>
                      {secondaryTitle ? (
                        <p
                          lang={preferArabic ? 'en' : 'ar'}
                          dir={preferArabic ? 'ltr' : 'rtl'}
                          className={
                            preferArabic
                              ? 'truncate font-label-sm text-label-sm leading-snug text-stone dark:text-dark-text-secondary'
                              : 'w-fit max-w-full truncate font-arabic-ui text-[0.95rem] leading-snug text-primary dark:text-dark-green'
                          }
                        >
                          {secondaryTitle}
                        </p>
                      ) : !isNumericBook ? (
                        <p className="font-label-sm text-label-sm leading-snug text-stone dark:text-dark-text-secondary">
                          {bookNumberLabel(book, (n) => t('hadithReader.bookNumber', { number: n }))}
                        </p>
                      ) : null}
                      <p className="font-label-sm text-label-sm leading-snug text-stone/80 tabular-nums dark:text-dark-text-secondary/80">
                        {t('hadithReader.hadithCount', { count: formatInteger(book.hadithCount) })}
                      </p>
                    </div>

                    <span className="material-symbols-outlined shrink-0 text-[20px] text-stone/40 dark:text-dark-text-secondary/40 rtl:rotate-180">
                      chevron_right
                    </span>
                  </div>
                </HoverCard>
              </LocalizedLink>
            </StaggerListItem>
          )
        })}
      </StaggerList>

      {showPagination ? (
        <nav
          aria-label={t('common.pagination.navLabel')}
          className="mt-8 flex items-center justify-between gap-3"
        >
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-2 font-label-sm text-label-sm text-ink-soft disabled:opacity-40 dark:border-dark-border dark:text-dark-text-secondary"
          >
            <span className="material-symbols-outlined text-[18px] rtl:rotate-180">chevron_left</span>
            {t('common.previous')}
          </button>

          <span className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary tabular-nums">
            {t('common.pagination.pageOf', { page: currentPage, total: totalPages })}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-2 font-label-sm text-label-sm text-ink-soft disabled:opacity-40 dark:border-dark-border dark:text-dark-text-secondary"
          >
            {t('common.next')}
            <span className="material-symbols-outlined text-[18px] rtl:rotate-180">chevron_right</span>
          </button>
        </nav>
      ) : null}

      <div className="mt-8">
        <AttributionChip
          source={getHadithProviderLabel()}
          url="https://sunnah.com/developers"
        />
      </div>
    </PageShell>
  )
}
