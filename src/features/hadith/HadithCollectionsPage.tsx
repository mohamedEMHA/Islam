import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import {
  HADITH_COLLECTIONS,
  getHadithCollectionName,
  getHadithProviderLabel,
  searchHadith,
  searchHadithAll,
} from '@/lib/api/hadith'
import { buildHadithReaderPath } from '@/lib/utils/sunnahParsers'
import type { HadithEntry } from '@/types/hadith'
import { PageShell } from '@/components/ui/PageShell'
import { Input } from '@/components/ui/Input'
import { StitchSwitch } from '@/components/ui/StitchSwitch'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { AttributionChip } from '@/components/content/AttributionChip'
import { GradingBadge } from '@/components/content/GradingBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'

const DEFAULT_SEARCH_COLLECTION = 'bukhari'

export function HadithCollectionsPage() {
  const { t } = useTranslation()
  const { formatInteger } = useLocaleFormat()
  const searchAllId = useId()
  const [query, setQuery] = useState('')
  const [searchAll, setSearchAll] = useState(false)
  const [results, setResults] = useState<HadithEntry[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setSearching(false)
      return
    }

    const controller = new AbortController()
    setSearching(true)
    const timer = window.setTimeout(() => {
      const request = searchAll
        ? searchHadithAll(trimmed, 20, controller.signal)
        : searchHadith(DEFAULT_SEARCH_COLLECTION, trimmed, 20, controller.signal)

      request
        .then((next) => {
          setResults(next)
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setResults([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false)
        })
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query, searchAll])

  const showResults = query.trim().length > 0

  return (
    <PageShell
      title={t('pages.hadith.title')}
      subtitle={t('pages.hadith.subtitle')}
    >
      <HoverCard className="mb-8 p-5 md:p-6 dark:bg-dark-surface dark:border-dark-border">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-secondary dark:text-dark-green text-2xl">
            search
          </span>
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text">
            {t('common.search')}
          </h2>
        </div>

        <Input
          placeholder={t('hadithReader.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-5"
        />

        <div className="flex items-start justify-between gap-4 border-t border-hairline dark:border-dark-border pt-4">
          <div className="min-w-0">
            <label
              htmlFor={searchAllId}
              className="block font-semibold text-ink-black dark:text-dark-text cursor-pointer"
            >
              {t('hadithReader.searchAllCollections')}
            </label>
            <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary mt-1">
              {searchAll
                ? t('hadithReader.searchAllHint')
                : t('hadithReader.searchScopedHint')}
            </p>
          </div>
          <StitchSwitch
            id={searchAllId}
            checked={searchAll}
            onChange={setSearchAll}
            aria-label={t('hadithReader.searchAllCollections')}
          />
        </div>
      </HoverCard>

      {showResults && (
        <div className="mb-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text">
              {t('hadithReader.searchResults')}
            </h2>
            {!searching && results.length > 0 ? (
              <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary tabular-nums">
                {t('hadithReader.hadithCount', { count: formatInteger(results.length) })}
              </p>
            ) : null}
          </div>
          {searching ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <HoverCard className="p-6 text-center dark:bg-dark-surface dark:border-dark-border">
              <span className="material-symbols-outlined text-3xl text-stone dark:text-dark-text-secondary mb-2 block">
                search_off
              </span>
              <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                {t('hadithReader.noSearchResults')}
              </p>
            </HoverCard>
          ) : (
            <StaggerList className="space-y-3">
              {results.map((hadith) => (
                <StaggerListItem key={`${hadith.collection}:${hadith.id}`}>
                  <LocalizedLink
                    to={buildHadithReaderPath(hadith.collection, hadith.id, {
                      book: hadith.bookNumber,
                    })}
                  >
                    <HoverCard className="p-5 dark:bg-dark-surface dark:border-dark-border">
                      <div className="flex items-center gap-3 mb-3">
                        <GradingBadge grade={hadith.grade} />
                        <span className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                          {getHadithCollectionName(hadith.collection)} #{hadith.id}
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary line-clamp-3">
                        {hadith.english}
                      </p>
                    </HoverCard>
                  </LocalizedLink>
                </StaggerListItem>
              ))}
            </StaggerList>
          )}
        </div>
      )}

      <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-4">
        {t('common.collections')}
      </h2>
      <StaggerList className="grid md:grid-cols-2 gap-4">
        {HADITH_COLLECTIONS.map((col) => (
          <StaggerListItem key={col.id}>
            <LocalizedLink
              to={
                col.fortyBookNumber
                  ? `/hadith/${col.id}/books/${col.fortyBookNumber}`
                  : `/hadith/${col.id}/books`
              }
            >
              <HoverCard className="p-6 h-full dark:bg-dark-surface dark:border-dark-border">
                <h3 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-2">
                  {col.name}
                </h3>
                <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-3">
                  {t(`hadithCollections.${col.id}.description`)}
                </p>
                <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                  {t('hadithReader.hadithCount', { count: formatInteger(col.count) })}
                </p>
              </HoverCard>
            </LocalizedLink>
          </StaggerListItem>
        ))}
      </StaggerList>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <AttributionChip
          source={getHadithProviderLabel()}
          url="https://sunnah.com/developers"
        />
        <AttributionChip
          source="fawazahmed0/hadith-api (search)"
          url="https://github.com/fawazahmed0/hadith-api"
        />
      </div>
    </PageShell>
  )
}
