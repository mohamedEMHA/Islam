import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { LocalizedLink, useLocale } from '@/components/routing/LocalizedLink'
import { localizedPath } from '@/lib/i18n/localizedPath'
import {
  getHadithCollectionName,
  getHadithProviderLabel,
  HADITH_COLLECTIONS,
  isHadithCollection,
} from '@/lib/api/hadith'
import { useHadithBookList, useHadithBookMeta, useHadithChapters } from '@/lib/hooks/useHadithBooks'
import {
  buildHadithReaderPath,
  enrichChaptersFromHadiths,
  getChapterDisplayTitle,
  hasMeaningfulChapterTitle,
} from '@/lib/utils/sunnahParsers'
import { HadithChapterPicker } from '@/features/hadith/HadithChapterPicker'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { Skeleton } from '@/components/ui/Skeleton'
import { AsyncState } from '@/components/ui/AsyncState'
import { GradingBadge } from '@/components/content/GradingBadge'
import { AttributionChip } from '@/components/content/AttributionChip'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'
import type { HadithChapter, HadithEntry } from '@/types/hadith'

function normalizeChapterKey(value: string | null | undefined): string {
  if (!value) return ''
  return value.trim().replace(/\.0+$/, '')
}

function chapterMatchesParam(chapter: HadithChapter, param: string): boolean {
  const key = normalizeChapterKey(param)
  if (!key) return false
  return (
    chapter.chapterId === param ||
    chapter.chapterNumber === param ||
    normalizeChapterKey(chapter.chapterId) === key ||
    normalizeChapterKey(chapter.chapterNumber) === key
  )
}

function groupHadithsByChapter(
  hadiths: HadithEntry[],
  chapters: HadithChapter[],
): Array<{ chapter: HadithChapter | null; hadiths: HadithEntry[] }> {
  const chapterById = new Map(chapters.map((chapter) => [chapter.chapterId, chapter]))
  const groups = new Map<string, HadithEntry[]>()
  const ungrouped: HadithEntry[] = []

  for (const hadith of hadiths) {
    const chapterId = hadith.chapterId?.trim()
    if (!chapterId || chapterId === '0.00') {
      ungrouped.push(hadith)
      continue
    }
    const list = groups.get(chapterId) ?? []
    list.push(hadith)
    groups.set(chapterId, list)
  }

  const ordered: Array<{ chapter: HadithChapter | null; hadiths: HadithEntry[] }> = []

  for (const chapter of chapters) {
    if (chapter.chapterId === '0.00' || chapter.chapterNumber === '0') continue
    const list = groups.get(chapter.chapterId)
    if (list?.length) {
      ordered.push({ chapter, hadiths: list })
      groups.delete(chapter.chapterId)
    }
  }

  for (const [chapterId, list] of groups) {
    ordered.push({
      chapter: chapterById.get(chapterId) ?? {
        collection: '',
        bookNumber: '',
        chapterId,
        chapterNumber: chapterId.replace(/\.0+$/, '') || chapterId,
      },
      hadiths: list,
    })
  }

  if (ungrouped.length > 0) {
    ordered.push({ chapter: null, hadiths: ungrouped })
  }

  return ordered
}

export function HadithBookPage() {
  const { t } = useTranslation()
  const { formatInteger } = useLocaleFormat()
  const locale = useLocale()
  const { collection, bookNumber } = useParams<{ collection: string; bookNumber: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedChapterId = searchParams.get('chapter')
  const listRef = useRef<HTMLElement>(null)
  const isValidCollection = isHadithCollection(collection)

  const { data: bookMeta } = useHadithBookMeta(
    isValidCollection ? collection : undefined,
    bookNumber,
  )

  const { data: chapters = [], isLoading: chaptersLoading } = useHadithChapters(
    isValidCollection ? collection : undefined,
    bookNumber,
  )

  const {
    data: bookData,
    isLoading: hadithsLoading,
    isError,
    error,
    refetch,
  } = useHadithBookList(isValidCollection ? collection : undefined, bookNumber)

  useEffect(() => {
    if (!selectedChapterId || !listRef.current) return
    listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedChapterId])

  const usableChapters = useMemo(() => {
    const filtered = chapters.filter(
      (chapter) =>
        chapter.chapterId !== '0.00' &&
        chapter.chapterNumber !== '0' &&
        Boolean(chapter.chapterNumber),
    )
    return enrichChaptersFromHadiths(filtered, bookData?.hadiths ?? [])
  }, [chapters, bookData?.hadiths])

  const selectedChapter = useMemo(
    () =>
      selectedChapterId
        ? usableChapters.find((chapter) => chapterMatchesParam(chapter, selectedChapterId))
        : undefined,
    [usableChapters, selectedChapterId],
  )

  const visibleHadiths = useMemo(() => {
    const hadiths = bookData?.hadiths ?? []
    if (!selectedChapterId) return hadiths

    const matchKey = normalizeChapterKey(
      selectedChapter?.chapterId ?? selectedChapterId,
    )
    return hadiths.filter((hadith) => {
      if (!hadith.chapterId) return false
      return (
        hadith.chapterId === selectedChapterId ||
        hadith.chapterId === selectedChapter?.chapterId ||
        normalizeChapterKey(hadith.chapterId) === matchKey
      )
    })
  }, [bookData?.hadiths, selectedChapter, selectedChapterId])

  const groupedHadiths = useMemo(
    () => groupHadithsByChapter(visibleHadiths, usableChapters),
    [visibleHadiths, usableChapters],
  )

  const selectedChapterIndex = useMemo(() => {
    if (!selectedChapter) return -1
    return usableChapters.findIndex(
      (chapter) => chapter.chapterId === selectedChapter.chapterId,
    )
  }, [usableChapters, selectedChapter])

  const previousChapter =
    selectedChapterIndex > 0 ? usableChapters[selectedChapterIndex - 1] : undefined
  const nextChapter =
    selectedChapterIndex >= 0 && selectedChapterIndex < usableChapters.length - 1
      ? usableChapters[selectedChapterIndex + 1]
      : undefined

  if (!isValidCollection || !bookNumber) {
    return <Navigate to={localizedPath('/hadith', locale)} replace />
  }

  const collectionMeta = HADITH_COLLECTIONS.find((item) => item.id === collection)
  const isFortyCollection = Boolean(collectionMeta?.fortyBookNumber)
  const backPath = isFortyCollection ? '/hadith' : `/hadith/${collection}/books`
  const backLabel = isFortyCollection
    ? t('hadithReader.backToCollections')
    : t('hadithReader.backToBooks')

  const pageTitle = bookMeta?.nameEn
    ? `${getHadithCollectionName(collection)} · ${bookMeta.nameEn}`
    : `${getHadithCollectionName(collection)} · ${t('hadithReader.bookNumber', { number: bookNumber })}`

  const pageSubtitle = selectedChapter
    ? t('hadithReader.hadithCount', {
        count: formatInteger(visibleHadiths.length),
      })
    : t('hadithReader.hadithCount', {
        count: formatInteger(bookData?.total ?? bookData?.hadiths.length ?? 0),
      })

  const isLoading = hadithsLoading || (Boolean(selectedChapterId) && chaptersLoading)

  const goToChapter = (chapterId: string | null) => {
    if (!chapterId) {
      setSearchParams({}, { replace: true, preventScrollReset: true })
      return
    }
    setSearchParams({ chapter: chapterId }, { replace: true, preventScrollReset: true })
  }

  if (isLoading) {
    return (
      <PageShell title={pageTitle} subtitle={t('hadithReader.chaptersSubtitle')}>
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </PageShell>
    )
  }

  if (isError || !bookData) {
    return (
      <PageShell title={pageTitle} subtitle={t('hadithReader.chaptersSubtitle')}>
        <AsyncState
          error={error instanceof Error ? error.message : t('errors.generic')}
          onRetry={() => void refetch()}
        />
      </PageShell>
    )
  }

  return (
    <PageShell title={pageTitle} subtitle={pageSubtitle}>
      <LocalizedLink
        to={backPath}
        className="text-stone hover:text-secondary dark:text-dark-text-secondary dark:hover:text-dark-green font-label-sm text-label-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
        {backLabel}
      </LocalizedLink>

      {bookMeta?.introEn ? (
        <HoverCard className="p-5 mb-6 dark:bg-dark-surface dark:border-dark-border">
          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
            {bookMeta.introEn}
          </p>
        </HoverCard>
      ) : null}

      {(chaptersLoading || usableChapters.length > 0) && (
        <section className="mb-6 space-y-3">
          <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
            {t('hadithReader.jumpToChapter')}
          </p>

          {chaptersLoading ? (
            <Skeleton className="h-11 w-full rounded-lg" />
          ) : (
            <>
              <HadithChapterPicker
                chapters={usableChapters}
                selectedChapterId={selectedChapterId}
                onSelect={goToChapter}
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!previousChapter}
                  onClick={() => previousChapter && goToChapter(previousChapter.chapterId)}
                  className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-2 font-label-sm text-label-sm text-ink-soft disabled:opacity-40 dark:border-dark-border dark:text-dark-text-secondary"
                >
                  <span className="material-symbols-outlined text-[18px] rtl:rotate-180">chevron_left</span>
                  {t('common.previous')}
                </button>

                <span className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary tabular-nums">
                  {selectedChapter
                    ? t('hadithReader.chapterOf', {
                        current: selectedChapter.chapterNumber,
                        total: usableChapters.length,
                      })
                    : t('hadithReader.chapterOf', {
                        current: '\u2013',
                        total: usableChapters.length,
                      })}
                </span>

                <button
                  type="button"
                  disabled={
                    selectedChapterIndex >= 0
                      ? !nextChapter
                      : usableChapters.length === 0
                  }
                  onClick={() => {
                    if (nextChapter) {
                      goToChapter(nextChapter.chapterId)
                      return
                    }
                    if (selectedChapterIndex < 0 && usableChapters[0]) {
                      goToChapter(usableChapters[0].chapterId)
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-2 font-label-sm text-label-sm text-ink-soft disabled:opacity-40 dark:border-dark-border dark:text-dark-text-secondary"
                >
                  {t('common.next')}
                  <span className="material-symbols-outlined text-[18px] rtl:rotate-180">chevron_right</span>
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <section ref={listRef}>
        {selectedChapter ? (
          <div className="mb-5">
            {hasMeaningfulChapterTitle(selectedChapter) ? (
              <>
                <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green mb-1">
                  {t('hadithReader.chapterNumber', { number: selectedChapter.chapterNumber })}
                </p>
                <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text">
                  {getChapterDisplayTitle(selectedChapter)}
                </h2>
                {selectedChapter.titleAr &&
                selectedChapter.titleAr.trim() !== selectedChapter.titleEn?.trim() &&
                !/^باب\s*$/.test(selectedChapter.titleAr.trim()) ? (
                  <p dir="rtl" className="font-arabic-ui text-primary dark:text-dark-green mt-1">
                    {selectedChapter.titleAr}
                  </p>
                ) : null}
              </>
            ) : (
              <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text">
                {t('hadithReader.chapterNumber', { number: selectedChapter.chapterNumber })}
              </h2>
            )}
            {selectedChapter.introEn ? (
              <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mt-3 leading-relaxed italic">
                {selectedChapter.introEn}
              </p>
            ) : null}
          </div>
        ) : (
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-4">
            {t('hadithReader.hadithList')}
          </h2>
        )}

        {visibleHadiths.length === 0 ? (
          <HoverCard className="p-8 text-center dark:bg-dark-surface dark:border-dark-border">
            <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
              {t('hadithReader.noHadithsInChapter')}
            </p>
          </HoverCard>
        ) : (
          <div className="space-y-8">
            {groupedHadiths.map(({ chapter, hadiths }) => (
              <div key={chapter?.chapterId ?? 'ungrouped'} className="space-y-3">
                {chapter && !selectedChapterId ? (
                  <button
                    type="button"
                    onClick={() => goToChapter(chapter.chapterId)}
                    className="w-full text-start group"
                  >
                    {hasMeaningfulChapterTitle(chapter) ? (
                      <>
                        <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green">
                          {t('hadithReader.chapterNumber', { number: chapter.chapterNumber })}
                        </p>
                        <h3 className="font-body-lg text-body-lg text-ink-black dark:text-dark-text group-hover:text-secondary dark:group-hover:text-dark-green transition-colors">
                          {getChapterDisplayTitle(chapter)}
                        </h3>
                      </>
                    ) : (
                      <h3 className="font-body-lg text-body-lg text-ink-black dark:text-dark-text group-hover:text-secondary dark:group-hover:text-dark-green transition-colors">
                        {t('hadithReader.chapterNumber', { number: chapter.chapterNumber })}
                      </h3>
                    )}
                    {chapter.introEn ? (
                      <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mt-1 leading-relaxed line-clamp-2 italic">
                        {chapter.introEn}
                      </p>
                    ) : null}
                  </button>
                ) : null}

                <StaggerList className="space-y-3">
                  {hadiths.map((hadith) => (
                    <StaggerListItem key={`${hadith.collection}:${hadith.id}`}>
                      <LocalizedLink
                        to={buildHadithReaderPath(collection, hadith.id, {
                          book: bookNumber,
                          chapter: hadith.chapterId,
                        })}
                      >
                        <HoverCard className="p-5 dark:bg-dark-surface dark:border-dark-border">
                          <div className="flex items-center gap-3 mb-2">
                            <GradingBadge grade={hadith.grade} />
                            <span className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                              #{hadith.id}
                            </span>
                          </div>
                          {hadith.narrator ? (
                            <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mb-1">
                              {t('hadithReader.narrator')}: {hadith.narrator}
                            </p>
                          ) : null}
                          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary line-clamp-3">
                            {hadith.english}
                          </p>
                        </HoverCard>
                      </LocalizedLink>
                    </StaggerListItem>
                  ))}
                </StaggerList>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <AttributionChip
          source={getHadithProviderLabel()}
          url="https://sunnah.com/developers"
        />
      </div>
    </PageShell>
  )
}
