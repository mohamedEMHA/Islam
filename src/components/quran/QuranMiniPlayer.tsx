import { createPortal } from 'react-dom'
import { m as motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { spring } from '@/lib/motion'

interface QuranMiniPlayerProps {
  surahTitle: string
  reciterName: string
  ayahLabel: string
  playing: boolean
  progress?: number
  onToggle: () => void
  onPrev?: () => void
  onNext?: () => void
  canGoPrev?: boolean
  canGoNext?: boolean
}

export function QuranMiniPlayer({
  surahTitle,
  reciterName,
  ayahLabel,
  playing,
  progress = 0,
  onToggle,
  onPrev,
  onNext,
  canGoPrev = true,
  canGoNext = true,
}: QuranMiniPlayerProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const progressPercent = Math.min(100, Math.round(progress * 100))

  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      className="fixed inset-x-0 bottom-0 z-[var(--z-mini-player)] w-full border-t border-hairline bg-paper-white/95 shadow-[0_-8px_24px_rgba(20,83,45,0.08)] backdrop-blur-md pb-[var(--safe-bottom)] lg:inset-x-auto lg:bottom-6 lg:end-8 lg:w-96 lg:rounded-xl lg:border lg:pb-0 lg:shadow-lg lg:shadow-primary/10"
      initial={reduceMotion ? false : { y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={spring}
      role="region"
      aria-label={`${surahTitle}, ${ayahLabel}`}
    >
      <div className="relative h-1 w-full overflow-hidden bg-cream-deep lg:rounded-t-xl">
        <div
          role="progressbar"
          aria-label={t('pages.quran.playbackProgress')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          className="absolute top-0 start-0 h-full rounded-e-full bg-secondary transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading-h3 text-[15px] font-semibold text-primary">{surahTitle}</p>
          <p className="mt-0.5 truncate font-label-sm text-[12px] text-stone">
            {reciterName} · {ayahLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={t('pages.quran.miniPlayerPreviousAyah')}
            onClick={onPrev}
            disabled={!canGoPrev}
            className="flex min-h-11 min-w-11 items-center justify-center text-stone transition-colors hover:text-ink-soft disabled:pointer-events-none disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[22px]">skip_previous</span>
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? t('pages.quran.miniPlayerPause') : t('pages.quran.miniPlayerPlay')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-md shadow-secondary/20 transition-colors hover:bg-surface-tint"
          >
            <span className="material-symbols-outlined fill text-[26px]">
              {playing ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            type="button"
            aria-label={t('pages.quran.miniPlayerNextAyah')}
            onClick={onNext}
            disabled={!canGoNext}
            className="flex min-h-11 min-w-11 items-center justify-center text-stone transition-colors hover:text-ink-soft disabled:pointer-events-none disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[22px]">skip_next</span>
          </button>
        </div>
      </div>
    </motion.div>,
    document.body,
  )
}
