import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/format'
import type { AyahMetadata, AyahWord } from '@/types/quran'
import { QuranAyahMetadataStrip } from '@/components/quran/QuranAyahMetadataStrip'

interface QuranAyahCardProps {
  surahNumber: number
  ayahNumber: number
  surahTitle?: string
  arabic: string
  translation?: string
  metadata?: AyahMetadata
  arabicFontScale?: number
  active?: boolean
  wordsExpanded?: boolean
  words?: AyahWord[]
  wordsLoading?: boolean
  onPlay?: () => void
  onTafsirToggle?: () => void
  onWordsToggle?: () => void
}

export function QuranAyahCard({
  surahNumber,
  ayahNumber,
  surahTitle,
  arabic,
  translation,
  metadata,
  arabicFontScale = 1,
  active = false,
  wordsExpanded = false,
  words = [],
  wordsLoading = false,
  onPlay,
  onTafsirToggle,
  onWordsToggle,
}: QuranAyahCardProps) {
  const { t } = useTranslation()
  const shareUrl = `/share?type=ayah&surah=${surahNumber}&ayah=${ayahNumber}`

  const actionClass = (emphasize = false) =>
    cn(
      'min-h-9 min-w-9 flex items-center justify-center rounded-full transition-colors',
      emphasize
        ? 'text-secondary hover:bg-green-soft'
        : 'text-stone hover:bg-cream-deep hover:text-secondary',
    )

  return (
    <article
      id={`ayah-${ayahNumber}`}
      className={cn(
        'bg-paper-white border rounded-xl px-3.5 py-3 md:px-4 md:py-3.5 relative overflow-hidden group scroll-mt-40',
        'transition-[border-color,box-shadow,ring-color,transform] duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]',
        'hover:-translate-y-0.5',
        active
          ? 'border-secondary/30 shadow-sm shadow-secondary/10 ring-1 ring-secondary/20'
          : 'border-hairline hover:border-outline-variant hover:shadow-sm',
      )}
    >
      {active && <div className="absolute start-0 top-0 bottom-0 w-1 bg-secondary rounded-s-xl" />}
      <div className="flex gap-3 md:gap-4">
        <div className="flex flex-col items-center gap-0.5 shrink-0 w-9 md:w-10">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center font-label-sm text-[11px]',
              active
                ? 'border border-secondary/30 bg-green-soft/50 text-secondary'
                : 'border border-hairline text-stone',
            )}
          >
            {surahNumber}:{ayahNumber}
          </div>
          <button
            type="button"
            onClick={onPlay}
            aria-label={t('pages.quran.playAyah')}
            title={t('pages.quran.playAyah')}
            className={actionClass(active)}
          >
            <span className={cn('material-symbols-outlined text-[18px]', active && 'fill')}>
              play_arrow
            </span>
          </button>
          <button
            type="button"
            onClick={onTafsirToggle}
            aria-label={t('pages.quran.viewTafsir')}
            className={actionClass()}
          >
            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
          </button>
          <button
            type="button"
            onClick={onWordsToggle}
            aria-label={t('pages.quran.wordByWord')}
            className={cn(actionClass(wordsExpanded), wordsExpanded && 'bg-green-soft/50')}
          >
            <span className="material-symbols-outlined text-[18px]">abc</span>
          </button>
          <LocalizedLink
            to={shareUrl}
            rel="nofollow"
            aria-label={t('pages.quran.shareAyah')}
            className={actionClass()}
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </LocalizedLink>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div
            className="text-start font-arabic-quran text-ink-black leading-[1.75]"
            dir="rtl"
            style={{ fontSize: `calc(1.5rem * ${arabicFontScale})` }}
          >
            {arabic}
          </div>
          <QuranAyahMetadataStrip ayahNumber={ayahNumber} metadata={metadata} />
          {translation && (
            <div className="border-t border-hairline/50 pt-2 font-body-md text-body-md text-ink-soft leading-relaxed">
              {translation}
            </div>
          )}
          {wordsExpanded && (
            <div className="border-t border-hairline/50 pt-2">
              {wordsLoading ? (
                <p className="font-label-sm text-label-sm text-stone">{t('pages.quran.loadingWords')}</p>
              ) : words.length === 0 ? (
                <p className="font-label-sm text-label-sm text-stone">
                  {t('pages.quran.wordBreakdownUnavailable')}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {words.map((word) => (
                    <div
                      key={word.position}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg bg-cream-deep/60 border border-hairline min-w-[3.5rem]"
                    >
                      <span className="font-arabic-quran text-base text-primary" dir="rtl">
                        {word.text}
                      </span>
                      <span className="font-label-sm text-[10px] text-stone">{word.transliteration}</span>
                      <span className="font-label-sm text-[10px] text-ink-soft text-center">
                        {word.translation}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {surahTitle && (
            <p className="sr-only">
              {surahTitle}, ayah {ayahNumber}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
