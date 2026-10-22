import { cn } from '@/lib/utils/format'
import type { Ayah } from '@/types/quran'

interface QuranMushafViewProps {
  arabic: Ayah[]
  arabicFontScale?: number
  activeAyah?: number
  onAyahSelect?: (ayahNumber: number) => void
}

export function QuranMushafView({
  arabic,
  arabicFontScale = 1,
  activeAyah,
  onAyahSelect,
}: QuranMushafViewProps) {
  return (
    <div
      className="mx-auto max-w-3xl px-margin-mobile md:px-8 xl:px-margin-desktop py-5 md:py-6"
      dir="rtl"
      lang="ar"
    >
      <div
        className="font-arabic-quran text-ink-black text-justify leading-[2.35]"
        style={{ fontSize: `calc(1.75rem * ${arabicFontScale})` }}
      >
        {arabic.map((ayah) => {
          const isActive = activeAyah === ayah.numberInSurah
          return (
            <span
              key={ayah.numberInSurah}
              id={`ayah-${ayah.numberInSurah}`}
              role="button"
              tabIndex={0}
              onClick={() => onAyahSelect?.(ayah.numberInSurah)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onAyahSelect?.(ayah.numberInSurah)
                }
              }}
              className={cn(
                'inline transition-colors rounded-sm cursor-pointer scroll-mt-48 lg:scroll-mt-40',
                isActive && 'bg-green-soft/50 text-primary',
              )}
            >
              {ayah.text}{' '}
              <span
                className={cn(
                  'inline-flex items-center justify-center mx-1 align-middle rounded-full border font-label-sm text-[11px] leading-none w-6 h-6',
                  isActive
                    ? 'border-secondary/40 text-secondary bg-paper-white'
                    : 'border-hairline text-stone',
                )}
                aria-hidden
              >
                {ayah.numberInSurah}
              </span>{' '}
            </span>
          )
        })}
      </div>
    </div>
  )
}
