import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/ui/PageShell'
import { Input } from '@/components/ui/Input'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { AttributionChip } from '@/components/content/AttributionChip'
import { AsyncState } from '@/components/ui/AsyncState'
import {
  filterDeadQurangoStations,
  filterRadioStations,
  getRadioStations,
  type RadioLanguage,
} from '@/lib/api/mp3quran'
import { scrollWindowToTop } from '@/lib/utils/scroll'
import { useRadioPlayer } from '@/lib/hooks/useRadioPlayer'

const STATIONS_PER_PAGE = 10

const LANGUAGE_OPTIONS: Array<{ value: RadioLanguage; labelKey: string }> = [
  { value: 'eng', labelKey: 'pages.islamicRadio.languages.eng' },
  { value: 'ar', labelKey: 'pages.islamicRadio.languages.ar' },
  { value: 'fr', labelKey: 'pages.islamicRadio.languages.fr' },
  { value: 'ur', labelKey: 'pages.islamicRadio.languages.ur' },
  { value: 'id', labelKey: 'pages.islamicRadio.languages.id' },
]

export function IslamicRadioPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [language, setLanguage] = useState<RadioLanguage>('eng')
  const [query, setQuery] = useState('')
  const [stations, setStations] = useState<Awaited<ReturnType<typeof getRadioStations>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { playingId, loadingId, errorId, handlePlay, clearRadioError } = useRadioPlayer()

  useEffect(() => {
    const langMap: Record<string, RadioLanguage> = {
      en: 'eng',
      ar: 'ar',
      fr: 'fr',
      ur: 'ur',
      id: 'id',
    }
    setLanguage(langMap[i18n.language.split('-')[0]] ?? 'eng')
  }, [i18n.language])

  const loadGenerationRef = useRef(0)

  const loadStations = useCallback(() => {
    const generation = ++loadGenerationRef.current
    setLoading(true)
    setError(null)
    getRadioStations(language)
      .then(async (list) => {
        if (generation !== loadGenerationRef.current) return
        setStations(list)
        setLoading(false)
        // mp3quran lists stale Qurango URLs (e.g. Noreen → 404). Prune in background.
        const reachable = await filterDeadQurangoStations(list)
        if (generation !== loadGenerationRef.current) return
        setStations(reachable)
      })
      .catch((err) => {
        if (generation !== loadGenerationRef.current) return
        setStations([])
        setError(err instanceof Error ? err.message : t('errors.generic'))
        setLoading(false)
      })
  }, [language, t])

  useEffect(() => {
    loadStations()
    return () => {
      loadGenerationRef.current += 1
    }
  }, [loadStations])

  const filtered = useMemo(() => filterRadioStations(stations, query), [stations, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / STATIONS_PER_PAGE))
  const rawPage = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const currentPage =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.min(rawPage, totalPages) : 1

  useEffect(() => {
    if (loading) return
    const param = searchParams.get('page')
    if (!param && currentPage <= 1) return
    const parsed = Number.parseInt(param ?? '1', 10)
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > totalPages || parsed !== currentPage) {
      const next = new URLSearchParams(searchParams)
      if (currentPage <= 1) next.delete('page')
      else next.set('page', String(currentPage))
      setSearchParams(next, { replace: true, preventScrollReset: true })
    }
  }, [currentPage, loading, searchParams, setSearchParams, totalPages])

  useEffect(() => {
    if (!searchParams.get('page')) return
    const next = new URLSearchParams(searchParams)
    next.delete('page')
    setSearchParams(next, { replace: true, preventScrollReset: true })
    // Reset to page 1 when language or filter changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [language, query])

  const pageStations = useMemo(() => {
    const start = (currentPage - 1) * STATIONS_PER_PAGE
    return filtered.slice(start, start + STATIONS_PER_PAGE)
  }, [filtered, currentPage])

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page <= 1) next.delete('page')
    else next.set('page', String(page))
    setSearchParams(next, { replace: true, preventScrollReset: true })
    scrollWindowToTop()
  }

  useEffect(() => {
    if (!errorId) return
    setStations((prev) => prev.filter((station) => station.id !== errorId))
    clearRadioError()
  }, [errorId, clearRadioError])

  const showPagination = !loading && !error && filtered.length > STATIONS_PER_PAGE

  return (
    <PageShell
      title={t('pages.islamicRadio.title')}
      subtitle={t('pages.islamicRadio.subtitle')}
    >
      <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-6 leading-relaxed">
        {t('pages.islamicRadio.intro')}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder={t('pages.islamicRadio.filterPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as RadioLanguage)}
          className="rounded-lg border border-hairline bg-white px-3 py-2 font-body-md text-body-md text-ink-black dark:bg-dark-surface dark:border-dark-border dark:text-dark-text"
          aria-label={t('pages.islamicRadio.languageLabel')}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {errorId && (
        <p
          role="alert"
          className="font-body-md text-body-md text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3 mb-6"
        >
          {t('pages.islamicRadio.playbackError')}
        </p>
      )}

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <AsyncState error={error} onRetry={loadStations} />
      ) : filtered.length === 0 ? (
        <HoverCard className="p-6 text-center dark:bg-dark-surface dark:border-dark-border">
          <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
            {t('pages.islamicRadio.noStations')}
          </p>
        </HoverCard>
      ) : (
        <StaggerList className="space-y-3">
          {pageStations.map((station) => {
            const isPlaying = playingId === station.id
            const isLoading = loadingId === station.id
            const hasError = errorId === station.id

            return (
              <StaggerListItem key={station.id}>
                <HoverCard className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 dark:bg-dark-surface dark:border-dark-border">
                  <div className="flex items-start gap-4">
                    <span
                      className={`material-symbols-outlined text-2xl mt-0.5 ${
                        isPlaying
                          ? 'text-secondary dark:text-dark-green animate-pulse'
                          : hasError
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-secondary dark:text-dark-green'
                      }`}
                      aria-hidden
                    >
                      {isPlaying ? 'radio' : hasError ? 'error' : 'podcasts'}
                    </span>
                    <div>
                      <p className="font-body-lg text-body-lg font-medium text-ink-black dark:text-dark-text">
                        {station.name}
                      </p>
                      {hasError ? (
                        <p className="font-label-sm text-label-sm text-red-600 dark:text-red-400 mt-1">
                          {t('pages.islamicRadio.playbackErrorShort')}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => {
                      clearRadioError()
                      handlePlay(station.id, station.url)
                    }}
                    className="flex items-center gap-2"
                    aria-busy={isLoading}
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden>
                      {isLoading ? 'hourglass_top' : isPlaying ? 'stop' : 'play_arrow'}
                    </span>
                    {isLoading
                      ? t('pages.islamicRadio.loading')
                      : isPlaying
                        ? t('pages.islamicRadio.stop')
                        : t('pages.islamicRadio.play')}
                  </Button>
                </HoverCard>
              </StaggerListItem>
            )
          })}
        </StaggerList>
      )}

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
        <AttributionChip source="mp3quran.net" url="https://mp3quran.net/ar/api" />
      </div>
    </PageShell>
  )
}
