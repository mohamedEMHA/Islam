import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useParams, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useLocalizedNavigate } from '@/lib/hooks/useLocalizedNavigate'
import { useLocale } from '@/components/routing/LocalizedLink'
import { localizedPath } from '@/lib/i18n/localizedPath'
import {
  findAyahForTime,
  getAudioUrl,
  getAyahWords,
  getTafsirEditionForLanguage,
  RECITERS,
  TAFSIR_ATTRIBUTION,
  TRANSLATIONS,
} from '@/lib/api/quran'
import { useQuranList } from '@/lib/hooks/useQuranList'
import { useSurah } from '@/lib/hooks/useSurah'
import { useSurahMetadata } from '@/lib/hooks/useSurahMetadata'
import { useAyahTafsir } from '@/lib/hooks/useAyahTafsir'
import { useVerseTimings } from '@/lib/hooks/useVerseTimings'
import { getJuzForSurah } from '@/lib/data/juzMapping'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { useReadingStore } from '@/lib/stores/readingStore'
import { QuranAyahCard } from '@/components/quran/QuranAyahCard'
import { QuranMushafView } from '@/components/quran/QuranMushafView'
import { QuranMiniPlayer } from '@/components/quran/QuranMiniPlayer'
import { TafsirText } from '@/components/quran/TafsirText'
import { AttributionChip } from '@/components/content/AttributionChip'
import { Skeleton } from '@/components/ui/Skeleton'
import { AsyncState } from '@/components/ui/AsyncState'
import type { AyahWord } from '@/types/quran'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/format'
import { easeOutSoft } from '@/lib/motion'

const toolbarSelectClass =
  'appearance-none w-full bg-transparent border-0 py-0.5 pe-4 font-label-sm text-label-sm text-ink-black focus:outline-none focus:text-secondary transition-colors cursor-pointer disabled:opacity-40'

function OptionsField({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-0.5 min-w-0 shrink-0', className)}>
      <span className="font-label-sm text-[10px] uppercase tracking-widest text-stone">{label}</span>
      {children}
    </label>
  )
}

function ModeToggle({
  isMushaf,
  studyLabel,
  mushafLabel,
  ariaLabel,
  onStudy,
  onMushaf,
  className,
}: {
  isMushaf: boolean
  studyLabel: string
  mushafLabel: string
  ariaLabel: string
  onStudy: () => void
  onMushaf: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex h-8 items-center rounded-full border border-hairline bg-paper-white p-0.5 shrink-0',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={onStudy}
        aria-pressed={!isMushaf}
        className={cn(
          'h-full px-2.5 sm:px-3 rounded-full font-label-sm text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap',
          !isMushaf
            ? 'bg-primary text-paper-white'
            : 'text-ink-soft hover:text-ink-black',
        )}
      >
        {studyLabel}
      </button>
      <button
        type="button"
        onClick={onMushaf}
        aria-pressed={isMushaf}
        className={cn(
          'h-full px-2.5 sm:px-3 rounded-full font-label-sm text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap',
          isMushaf
            ? 'bg-primary text-paper-white'
            : 'text-ink-soft hover:text-ink-black',
        )}
      >
        {mushafLabel}
      </button>
    </div>
  )
}

export function QuranReaderPage() {
  const { t, i18n } = useTranslation()
  const navigate = useLocalizedNavigate()
  const locale = useLocale()
  const { pathname, hash } = useLocation()
  const { surahId } = useParams<{ surahId: string }>()
  const quranScript = useSettingsStore((s) => s.quranScript)
  const quranReaderMode = useSettingsStore((s) => s.quranReaderMode)
  const translationEdition = useSettingsStore((s) => s.translationEdition)
  const reciterId = useSettingsStore((s) => s.reciterId)
  const quranFontSize = useSettingsStore((s) => s.quranFontSize)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const setLastSurah = useReadingStore((s) => s.setLastSurah)
  const isMushaf = quranReaderMode === 'mushaf'
  const reduceMotion = useReducedMotion()
  const num = Number(surahId)
  const isValidSurah = Number.isInteger(num) && num >= 1 && num <= 114
  const { data: surahList } = useQuranList()
  const {
    data: surahData,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useSurah(num, quranScript, translationEdition, isValidSurah)
  const { data: ayahMetadata } = useSurahMetadata(num, isValidSurah)
  const { data: verseTimings = [] } = useVerseTimings(num, reciterId, isValidSurah)
  const arabic = surahData?.arabic ?? []
  const translation = surahData?.translation ?? []
  const translationByAyah = useMemo(() => {
    const map = new Map<number, string>()
    for (const ayah of translation) {
      if (ayah.text) map.set(ayah.numberInSurah, ayah.text)
    }
    return map
  }, [translation])
  const timingsByAyah = useMemo(() => {
    const map = new Map<number, { start: number; end: number }>()
    for (const timing of verseTimings) {
      map.set(timing.ayahNumber, { start: timing.start, end: timing.end })
    }
    return map
  }, [verseTimings])
  const surahMeta = surahList?.find((s) => s.number === num) ?? null
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : t('errors.generic')
    : null
  const [playing, setPlaying] = useState(false)
  const [activeAyah, setActiveAyah] = useState(1)
  const [audioProgress, setAudioProgress] = useState(0)
  const [showTranslation, setShowTranslation] = useState(true)
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null)
  const tafsirEdition = getTafsirEditionForLanguage(i18n.language)
  const tafsirAttribution = TAFSIR_ATTRIBUTION[tafsirEdition]
  const {
    data: tafsirText,
    isLoading: tafsirLoading,
    error: tafsirError,
  } = useAyahTafsir(num, tafsirAyah ?? 0, tafsirAyah !== null)
  const [expandedWordsAyah, setExpandedWordsAyah] = useState<number | null>(null)
  const [wordsCache, setWordsCache] = useState<Record<number, AyahWord[]>>({})
  const [wordsLoadingAyah, setWordsLoadingAyah] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const juzNumber = isValidSurah
    ? (ayahMetadata?.[activeAyah]?.juz ?? getJuzForSurah(num))
    : 1
  const initialLoading = loading && arabic.length === 0

  useEffect(() => {
    setTafsirAyah(null)
    setExpandedWordsAyah(null)
    setWordsCache({})
    setActiveAyah(1)
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
    setAudioProgress(0)
  }, [num, quranScript, translationEdition, reciterId])

  useEffect(() => {
    setTafsirAyah(null)
  }, [pathname])

  useEffect(() => {
    if (tafsirAyah === null) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [tafsirAyah])

  useEffect(() => {
    if (!isValidSurah || !surahMeta) return
    setLastSurah({
      surahId: num,
      ayah: activeAyah,
      englishName: surahMeta.englishName,
    })
  }, [isValidSurah, num, activeAyah, surahMeta, setLastSurah])

  useEffect(() => {
    const match = hash.match(/^#ayah-(\d+)$/)
    if (!match || arabic.length === 0) return
    const ayahNum = Math.min(Math.max(1, Number(match[1])), arabic.length)
    setActiveAyah(ayahNum)
    requestAnimationFrame(() => {
      document.getElementById(`ayah-${ayahNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [hash, loading, arabic.length])

  const wordsRequestRef = useRef(0)
  const loadWords = useCallback(
    async (ayahNumber: number) => {
      if (wordsCache[ayahNumber] || !num) return
      const requestId = ++wordsRequestRef.current
      setWordsLoadingAyah(ayahNumber)
      try {
        const words = await getAyahWords(num, ayahNumber)
        if (wordsRequestRef.current !== requestId) return
        setWordsCache((prev) => ({ ...prev, [ayahNumber]: words }))
      } catch {
        if (wordsRequestRef.current !== requestId) return
        setWordsCache((prev) => ({ ...prev, [ayahNumber]: [] }))
      } finally {
        if (wordsRequestRef.current === requestId) {
          setWordsLoadingAyah(null)
        }
      }
    },
    [num, wordsCache],
  )

  const handleWordsToggle = (ayahNumber: number) => {
    if (expandedWordsAyah === ayahNumber) {
      setExpandedWordsAyah(null)
      return
    }
    setExpandedWordsAyah(ayahNumber)
    void loadWords(ayahNumber)
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || arabic.length === 0 || !audio.duration) return

    const currentTime = audio.currentTime
    setAudioProgress(currentTime / audio.duration)

    const syncedAyah =
      verseTimings.length > 0
        ? findAyahForTime(verseTimings, currentTime)
        : Math.min(
            arabic.length,
            Math.max(1, Math.ceil((currentTime / audio.duration) * arabic.length)),
          )

    if (syncedAyah === null) return

    setActiveAyah((previous) => {
      if (previous === syncedAyah) return previous
      requestAnimationFrame(() => {
        document
          .getElementById(`ayah-${syncedAyah}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
      return syncedAyah
    })
  }

  const seekToAyah = (ayahNumber: number, { play = false }: { play?: boolean } = {}) => {
    setActiveAyah(ayahNumber)
    const timing = timingsByAyah.get(ayahNumber)
    const audio = audioRef.current
    if (audio && timing) {
      audio.currentTime = timing.start
      if (play || playing) {
        void audio.play()
        setPlaying(true)
      }
    } else if (audio && (play || playing)) {
      void audio.play()
      setPlaying(true)
    }
    requestAnimationFrame(() => {
      document.getElementById(`ayah-${ayahNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      void audioRef.current.play()
      setPlaying(true)
    }
  }

  const reciter = RECITERS.find((r) => r.id === reciterId) ?? RECITERS[0]
  const surahTitle = surahMeta ? `${num}. ${surahMeta.englishName}` : `Surah ${num}`

  const goToPrevAyah = () => {
    if (activeAyah > 1) seekToAyah(activeAyah - 1, { play: playing })
  }

  const goToNextAyah = () => {
    if (activeAyah < arabic.length) seekToAyah(activeAyah + 1, { play: playing })
  }

  if (!isValidSurah) {
    return <Navigate to={localizedPath('/quran', locale)} replace />
  }

  if (initialLoading) {
    return (
      <div className="pb-[calc(5.5rem+var(--safe-bottom))] bg-surface min-h-dvh flex flex-col" aria-busy="true" aria-label={t('common.loading')}>
        <div className="sticky top-0 z-30 bg-surface/95 border-b border-hairline px-4 py-3">
          <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-2 flex-1 max-w-xs mx-auto text-center">
              <Skeleton className="h-5 w-40 mx-auto rounded" />
              <Skeleton className="h-3 w-24 mx-auto rounded" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
        <div className="p-6 space-y-4 max-w-3xl mx-auto w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-hairline dark:border-dark-border bg-paper-white dark:bg-dark-surface p-5 space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-5/6 ms-auto rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if ((error || arabic.length === 0) && !isFetching) {
    return (
      <div className="p-6 bg-surface min-h-dvh">
        <AsyncState
          error={error ?? t('quranReader.contentUnavailable')}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-0 flex flex-col pb-[calc(5.5rem+var(--safe-bottom))]">
      <header className="sticky z-30 top-[calc(2.25rem+4rem)] md:top-16 lg:top-0 bg-surface/95 backdrop-blur-md border-b border-hairline">
        <div className="px-margin-mobile md:px-8 xl:px-margin-desktop">
          <div className="flex items-center gap-2 sm:gap-3 h-14">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <LocalizedLink
                to="/quran"
                className="shrink-0 text-stone hover:text-secondary transition-colors"
                aria-label={t('common.back')}
              >
                <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_back</span>
              </LocalizedLink>
              <div className="min-w-0">
                <select
                  value={num}
                  onChange={(e) => navigate(`/quran/${e.target.value}`)}
                  className="appearance-none bg-transparent border-0 py-0 font-body-md text-body-md text-ink-black focus:outline-none focus:text-secondary cursor-pointer max-w-[8rem] sm:max-w-[14rem] truncate block"
                  aria-label={t('quranReader.surahLabel')}
                >
                  {(surahList ?? []).map((surah) => (
                    <option key={surah.number} value={surah.number}>
                      {surah.number}. {surah.englishName}
                    </option>
                  ))}
                  {(!surahList || surahList.length === 0) && (
                    <option value={num}>{surahTitle}</option>
                  )}
                </select>
                <p className="font-label-sm text-[11px] text-stone uppercase tracking-widest">
                  {t('quranReader.meta.juz')} {juzNumber}
                  {isFetching ? ` · ${t('common.loading')}` : ''}
                </p>
              </div>
            </div>

            <ModeToggle
              isMushaf={isMushaf}
              studyLabel={t('quranReader.studyMode')}
              mushafLabel={t('quranReader.mushafMode')}
              ariaLabel={t('quranReader.modeLabel')}
              onStudy={() => updateSettings({ quranReaderMode: 'study' })}
              onMushaf={() => updateSettings({ quranReaderMode: 'mushaf' })}
            />

            <LocalizedLink
              to="/settings"
              aria-label={t('quranReader.readerSettings')}
              className="shrink-0 text-stone hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </LocalizedLink>
          </div>

          <div className="-mx-margin-mobile md:mx-0 overflow-x-auto border-t border-hairline/70 scrollbar-none">
            <div className="flex flex-nowrap items-start gap-5 sm:gap-6 md:gap-8 px-margin-mobile md:px-0 pe-6 md:pe-0 py-2.5 w-max">
              {!isMushaf && (
                <>
                  <OptionsField label={t('quranReader.translationView')}>
                    <button
                      type="button"
                      onClick={() => setShowTranslation((value) => !value)}
                      aria-pressed={showTranslation}
                      className={cn(
                        'h-9 font-label-sm text-label-sm text-start transition-colors whitespace-nowrap',
                        showTranslation ? 'text-secondary' : 'text-stone hover:text-ink-soft',
                      )}
                    >
                      {showTranslation ? t('common.on') : t('common.off')}
                    </button>
                  </OptionsField>

                  <OptionsField label={t('quranReader.editionLabel')} className="w-[9.5rem] shrink-0">
                    <select
                      value={translationEdition}
                      onChange={(e) => updateSettings({ translationEdition: e.target.value })}
                      className={cn(toolbarSelectClass, 'h-9 truncate')}
                      disabled={!showTranslation}
                    >
                      {TRANSLATIONS.map((edition) => (
                        <option key={edition.id} value={edition.id}>
                          {edition.name}
                        </option>
                      ))}
                    </select>
                  </OptionsField>
                </>
              )}

              <OptionsField label={t('quranReader.scriptLabel')} className="shrink-0">
                <select
                  value={quranScript}
                  onChange={(e) => updateSettings({ quranScript: e.target.value as 'uthmani' | 'indopak' })}
                  className={cn(toolbarSelectClass, 'h-9')}
                >
                  <option value="uthmani">{t('quranReader.scripts.uthmani')}</option>
                  <option value="indopak">{t('quranReader.scripts.indopak')}</option>
                </select>
              </OptionsField>

              <OptionsField label={t('quranReader.reciterLabel')} className="w-[10.5rem] shrink-0">
                <select
                  value={reciterId}
                  onChange={(e) => updateSettings({ reciterId: e.target.value })}
                  className={cn(toolbarSelectClass, 'h-9 truncate')}
                >
                  {RECITERS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </OptionsField>

              {!isMushaf && (
                <OptionsField label={t('quranReader.tafsir')} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setTafsirAyah(activeAyah)}
                    className="h-9 font-label-sm text-label-sm text-ink-black hover:text-secondary transition-colors whitespace-nowrap"
                  >
                    {t('quranReader.openTafsir')}
                  </button>
                </OptionsField>
              )}
            </div>
          </div>
        </div>
      </header>

      {num !== 9 && num !== 1 && (
        <div
          className={cn(
            'flex justify-center items-center border-b border-hairline mx-margin-mobile md:mx-margin-desktop',
            isMushaf ? 'py-5' : 'py-6',
          )}
        >
          <h2
            className={cn(
              'font-arabic-quran text-primary',
              isMushaf ? 'text-[2rem] md:text-[2.25rem]' : 'text-[1.75rem] md:text-[1.875rem]',
            )}
            dir="rtl"
            style={{ lineHeight: 1.8 }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </h2>
        </div>
      )}

      {isMushaf ? (
        <QuranMushafView
          arabic={arabic}
          arabicFontScale={quranFontSize / 100}
          activeAyah={activeAyah}
          onAyahSelect={(ayahNumber) => {
            seekToAyah(ayahNumber, { play: playing })
          }}
        />
      ) : (
        <StaggerList className="flex-1 py-4 px-margin-mobile md:px-8 xl:px-margin-desktop w-full max-w-3xl mx-auto space-y-2">
          {arabic.map((ayah) => (
            <StaggerListItem key={ayah.numberInSurah}>
              <QuranAyahCard
                surahNumber={num}
                ayahNumber={ayah.numberInSurah}
                surahTitle={surahMeta?.englishName}
                arabic={ayah.text}
                translation={
                  showTranslation ? translationByAyah.get(ayah.numberInSurah) : undefined
                }
                metadata={ayahMetadata?.[ayah.numberInSurah]}
                arabicFontScale={quranFontSize / 100}
                active={activeAyah === ayah.numberInSurah}
                wordsExpanded={expandedWordsAyah === ayah.numberInSurah}
                words={wordsCache[ayah.numberInSurah]}
                wordsLoading={wordsLoadingAyah === ayah.numberInSurah}
                onPlay={() => {
                  seekToAyah(ayah.numberInSurah, { play: true })
                }}
                onTafsirToggle={() => setTafsirAyah(ayah.numberInSurah)}
                onWordsToggle={() => handleWordsToggle(ayah.numberInSurah)}
              />
            </StaggerListItem>
          ))}

          <div className="py-8 flex justify-center items-center">
            <div className="w-10 h-10 opacity-25 text-primary">
              <svg fill="currentColor" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40L50 0Z" />
              </svg>
            </div>
          </div>
        </StaggerList>
      )}

      <QuranMiniPlayer
        surahTitle={surahTitle}
        reciterName={reciter.name}
        ayahLabel={t('pages.tafsir.ayahLabel', { number: activeAyah })}
        playing={playing}
        progress={audioProgress}
        onToggle={togglePlay}
        onPrev={goToPrevAyah}
        onNext={goToNextAyah}
        canGoPrev={activeAyah > 1}
        canGoNext={activeAyah < arabic.length}
      />

      <audio
        ref={audioRef}
        src={getAudioUrl(num, reciterId)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setPlaying(false)
          setAudioProgress(0)
        }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />

      <AnimatePresence>
        {tafsirAyah !== null ? (
          <>
            <motion.button
              key="tafsir-backdrop"
              type="button"
              aria-label={t('common.close')}
              className="fixed inset-0 bg-ink-black/30 z-40"
              onClick={() => setTafsirAyah(null)}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={easeOutSoft}
            />
            <motion.aside
              key="tafsir-drawer"
              className="fixed top-0 end-0 h-full w-full max-w-md bg-paper-white border-s border-hairline shadow-xl z-50 flex flex-col"
              initial={reduceMotion ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: 24 }}
              transition={easeOutSoft}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
                <div>
                  <p className="font-heading-h3 text-heading-h3 text-ink-black">{t('quranReader.tafsir')}</p>
                  <p className="font-label-sm text-label-sm text-stone">
                    {surahTitle} · {t('pages.tafsir.ayahLabel', { number: tafsirAyah })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTafsirAyah(null)}
                  className="p-2 rounded-full text-stone hover:bg-cream-deep transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]"
                  aria-label={t('common.close')}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {tafsirLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                ) : tafsirError || !tafsirText ? (
                  <p className="font-body-md text-body-md text-stone italic">{t('pages.tafsir.unavailable')}</p>
                ) : (
                  <TafsirText text={tafsirText} />
                )}
              </div>
              <div className="px-6 py-4 border-t border-hairline">
                <AttributionChip
                  source={t(tafsirAttribution.labelKey)}
                  url={tafsirAttribution.url}
                  page="Tafsir"
                />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
