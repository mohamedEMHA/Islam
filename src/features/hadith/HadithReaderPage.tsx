import { useEffect, useMemo } from 'react'
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
import { useHadithCollection } from '@/lib/hooks/useHadithCollection'
import { useHadithBookList } from '@/lib/hooks/useHadithBooks'
import { useReadingStore } from '@/lib/stores/readingStore'
import {
  buildHadithReaderPath,
  isNumericHadithId,
} from '@/lib/utils/sunnahParsers'
import { ArabicText } from '@/components/content/ArabicText'
import { GradingBadge } from '@/components/content/GradingBadge'
import { AttributionChip } from '@/components/content/AttributionChip'
import { HoverCard } from '@/components/motion/HoverCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageShell } from '@/components/ui/PageShell'
import { AsyncState } from '@/components/ui/AsyncState'

function decodeRouteHadithId(raw: string | undefined): string {
  if (!raw) return ''
  try {
    return decodeURIComponent(raw).trim()
  } catch {
    return raw.trim()
  }
}

export function HadithReaderPage() {
  const { t, i18n } = useTranslation()
  const locale = useLocale()
  const showEnglishNotice = i18n.language.split('-')[0] !== 'en'
  const { collection, id: rawId } = useParams<{ collection: string; id: string }>()
  const [searchParams] = useSearchParams()
  const bookNumber = searchParams.get('book') ?? undefined
  const chapterId = searchParams.get('chapter') ?? undefined
  const hadithId = decodeRouteHadithId(rawId)
  const isValidId = hadithId.length > 0
  const isValidCollection = isHadithCollection(collection)

  const {
    data: hadith,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useHadithCollection(
    isValidCollection ? collection : undefined,
    isValidId ? hadithId : undefined,
    bookNumber,
  )

  const { data: bookData } = useHadithBookList(
    isValidCollection && bookNumber ? collection : undefined,
    bookNumber,
  )
  const setLastHadith = useReadingStore((s) => s.setLastHadith)

  useEffect(() => {
    if (!hadith || !collection) return
    setLastHadith({
      collection,
      id: hadith.id,
      bookNumber: bookNumber ?? hadith.bookNumber,
      label: `${getHadithCollectionName(hadith.collection)} #${hadith.id}`,
    })
  }, [hadith, collection, bookNumber, setLastHadith])

  const neighbors = useMemo(() => {
    const list = bookData?.hadiths ?? []
    if (list.length === 0 || !hadithId) {
      return { prevId: undefined as string | undefined, nextId: undefined as string | undefined }
    }
    const index = list.findIndex((entry) => entry.id === hadithId)
    if (index < 0) {
      return { prevId: undefined, nextId: undefined }
    }
    return {
      prevId: index > 0 ? list[index - 1]?.id : undefined,
      nextId: index < list.length - 1 ? list[index + 1]?.id : undefined,
    }
  }, [bookData?.hadiths, hadithId])

  if (!isValidCollection || !isValidId) {
    return <Navigate to={localizedPath('/hadith', locale)} replace />
  }

  const collectionMeta = HADITH_COLLECTIONS.find((c) => c.id === collection)
  const pageTitle = collectionMeta
    ? `${collectionMeta.name} #${hadithId}`
    : t('pages.hadith.title')

  if (isLoading) {
    return (
      <PageShell title={pageTitle} subtitle={collectionMeta?.name}>
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </PageShell>
    )
  }

  const fetchError = isError
    ? queryError instanceof Error
      ? queryError.message
      : t('errors.generic')
    : null

  if (fetchError || !hadith) {
    return (
      <PageShell title={pageTitle} subtitle={collectionMeta?.name}>
        <AsyncState
          error={fetchError ?? t('errors.hadithNotFound')}
          onRetry={() => void refetch()}
        />
      </PageShell>
    )
  }

  // Prefer ordered book-list neighbors; only fall back to +/-1 for pure numeric fawaz ids.
  let prevId = neighbors.prevId
  let nextId = neighbors.nextId
  if (!bookNumber && isNumericHadithId(hadith.id)) {
    const n = Number.parseInt(hadith.id, 10)
    const minNumber = 1
    const maxNumber = collectionMeta?.count ?? n
    if (n > minNumber) prevId = String(n - 1)
    if (n < maxNumber) nextId = String(n + 1)
  }

  const navLinkClass =
    'font-label-sm text-label-sm text-secondary hover:underline dark:text-dark-green'
  const navDisabledClass =
    'font-label-sm text-label-sm text-stone opacity-40 dark:text-dark-text-secondary'

  const navQuery = {
    book: bookNumber,
    chapter: chapterId,
  }

  const backToBookPath = bookNumber
    ? `/hadith/${collection}/books/${bookNumber}${chapterId ? `?chapter=${encodeURIComponent(chapterId)}` : ''}`
    : `/hadith/${collection}/books`

  const effectiveBookNumber = bookNumber ?? hadith.bookNumber

  return (
    <PageShell title={pageTitle} subtitle={collectionMeta?.name}>
      <LocalizedLink
        to={backToBookPath}
        className="text-stone hover:text-secondary dark:text-dark-text-secondary dark:hover:text-dark-green font-label-sm text-label-sm mb-6 inline-flex items-center gap-1 transition-colors"
      >
        <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
        {bookNumber || collectionMeta?.fortyBookNumber
          ? t('hadithReader.backToBook')
          : t('hadithReader.backToBooks')}
      </LocalizedLink>

      <div className="max-w-3xl mx-auto w-full">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <GradingBadge grade={hadith.grade} />
        <span className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
          {getHadithCollectionName(hadith.collection)} #{hadith.id}
        </span>
      </div>

      {(hadith.narrator || hadith.book || hadith.chapter) && (
        <div className="mb-6 space-y-1 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
          {hadith.narrator && (
            <p>
              <span className="text-ink-soft dark:text-dark-text">{t('hadithReader.narrator')}: </span>
              {hadith.narrator}
            </p>
          )}
          {(hadith.book || effectiveBookNumber) && (
            <p>
              <span className="text-ink-soft dark:text-dark-text">{t('hadithReader.book')}: </span>
              {hadith.book ?? t('hadithReader.bookNumber', { number: effectiveBookNumber })}
            </p>
          )}
          {hadith.chapter && (
            <p>
              <span className="text-ink-soft dark:text-dark-text">{t('hadithReader.chapter')}: </span>
              {hadith.chapter}
            </p>
          )}
        </div>
      )}

      {hadith.chapterIntro ? (
        <HoverCard className="p-5 mb-6 dark:bg-dark-surface dark:border-dark-border">
          <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green mb-2">
            {t('hadithReader.chapterIntro')}
          </p>
          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed italic">
            {hadith.chapterIntro}
          </p>
        </HoverCard>
      ) : null}

      {hadith.references ? (
        <div className="mb-6 space-y-1 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
          <p className="text-ink-soft dark:text-dark-text font-medium">{t('hadithReader.references')}</p>
          {hadith.references.bookNumber && hadith.references.hadithNumber ? (
            <p>
              {t('hadithReader.inBookRef', {
                book: hadith.references.bookNumber,
                hadith: hadith.references.hadithNumber,
              })}
            </p>
          ) : null}
          {hadith.references.urn ? <p>URN: {hadith.references.urn}</p> : null}
          {hadith.references.uscMsa ? (
            <a
              href={hadith.references.uscMsa}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary dark:text-dark-green hover:underline"
            >
              {t('hadithReader.sunnahLink')}
            </a>
          ) : null}
        </div>
      ) : null}

      {hadith.isnad && hadith.isnad.length > 0 ? (
        <HoverCard className="p-5 mb-6 dark:bg-dark-surface dark:border-dark-border">
          <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green mb-2">
            {t('hadithReader.isnad')}
          </p>
          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
            {hadith.isnad.map((segment) => segment.name).join(' \u2192 ')}
          </p>
        </HoverCard>
      ) : null}

      <HoverCard className="p-6 md:p-8 dark:bg-dark-surface dark:border-dark-border">
        {showEnglishNotice ? (
          <p className="mb-4 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
            {t('hadithReader.translationEnglishOnly')}
          </p>
        ) : null}
        {hadith.arabic ? (
          <ArabicText
            variant="ui"
            size="lg"
            className="mb-6 text-primary dark:text-dark-green"
          >
            {hadith.arabic}
          </ArabicText>
        ) : null}

        <p className="font-body-lg text-body-lg text-ink-soft dark:text-dark-text-secondary leading-relaxed whitespace-pre-wrap">
          {hadith.english}
        </p>

        <div className="flex flex-wrap justify-end gap-2 mt-6">
          <LocalizedLink
            to={`/share?type=hadith&ref=${encodeURIComponent(`${hadith.collection} #${hadith.id}`)}&text=${encodeURIComponent(hadith.english)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-hairline text-stone hover:text-secondary hover:border-secondary/30 font-label-sm text-label-sm transition-colors dark:border-dark-border dark:text-dark-text-secondary dark:hover:text-dark-green dark:hover:border-dark-green/30"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            {t('common.share')}
          </LocalizedLink>
        </div>
      </HoverCard>

      <div className="flex justify-between mt-8">
        {prevId ? (
          <LocalizedLink
            to={buildHadithReaderPath(collection, prevId, navQuery)}
            className={navLinkClass}
          >
            <span className="material-symbols-outlined text-sm rtl:rotate-180" aria-hidden>
              chevron_left
            </span>{' '}
            {t('common.previous')}
          </LocalizedLink>
        ) : (
          <span className={navDisabledClass}>
            <span className="material-symbols-outlined text-sm rtl:rotate-180" aria-hidden>
              chevron_left
            </span>{' '}
            {t('common.previous')}
          </span>
        )}
        {nextId ? (
          <LocalizedLink
            to={buildHadithReaderPath(collection, nextId, navQuery)}
            className={navLinkClass}
          >
            {t('common.next')}{' '}
            <span className="material-symbols-outlined text-sm rtl:rotate-180" aria-hidden>
              chevron_right
            </span>
          </LocalizedLink>
        ) : (
          <span className={navDisabledClass}>
            {t('common.next')}{' '}
            <span className="material-symbols-outlined text-sm rtl:rotate-180" aria-hidden>
              chevron_right
            </span>
          </span>
        )}
      </div>
      </div>

      <div className="mt-8">
        <AttributionChip
          source={hadith.source === 'fawazahmed0' ? 'fawazahmed0/hadith-api' : getHadithProviderLabel()}
          url={
            hadith.source === 'fawazahmed0'
              ? 'https://github.com/fawazahmed0/hadith-api'
              : 'https://sunnah.com/developers'
          }
        />
      </div>
    </PageShell>
  )
}
