import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { useReadingStore } from '@/lib/stores/readingStore'
import { FadeInSection } from '@/components/motion/FadeInSection'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { buildHadithReaderPath } from '@/lib/utils/sunnahParsers'

type FeaturedReading =
  | {
      kind: 'quran'
      to: string
      name: string
      role: string
      icon: 'menu_book'
    }
  | {
      kind: 'hadith'
      to: string
      name: string
      role: string
      icon: 'library_books'
    }
  | {
      kind: 'bookmark'
      to: string
      name: string
      role: string
      icon: 'bookmark'
    }

export function ContinueReadingSection() {
  const { t } = useTranslation()
  const lastSurah = useReadingStore((s) => s.lastSurah)
  const lastHadith = useReadingStore((s) => s.lastHadith)
  const bookmarks = useReadingStore((s) => s.bookmarks)

  if (!lastSurah && !lastHadith && bookmarks.length === 0) {
    return null
  }

  let featured: FeaturedReading | null = null

  const surahUpdated = lastSurah?.updatedAt ?? 0
  const hadithUpdated = lastHadith?.updatedAt ?? 0

  if (lastSurah && surahUpdated >= hadithUpdated) {
    featured = {
      kind: 'quran',
      to: `/quran/${lastSurah.surahId}#ayah-${lastSurah.ayah}`,
      name: lastSurah.englishName ?? t('home.surahNumber', { number: lastSurah.surahId }),
      role: `${t('home.ayahNumber', { number: lastSurah.ayah })} · ${t('home.continueQuran')}`,
      icon: 'menu_book',
    }
  } else if (lastHadith) {
    featured = {
      kind: 'hadith',
      to: buildHadithReaderPath(lastHadith.collection, lastHadith.id, {
        book: lastHadith.bookNumber,
      }),
      name: lastHadith.label ?? `${lastHadith.collection} #${lastHadith.id}`,
      role: t('home.continueHadith'),
      icon: 'library_books',
    }
  } else if (bookmarks[0]) {
    const b = bookmarks[0]
    featured = {
      kind: 'bookmark',
      to:
        b.type === 'ayah'
          ? `/quran/${b.surahId}#ayah-${b.ayah}`
          : buildHadithReaderPath(b.collection, b.id),
      name: b.label,
      role: t('home.continueBookmark'),
      icon: 'bookmark',
    }
  }

  if (!featured) return null

  const secondaryBookmarks = bookmarks.filter((b) => {
    if (featured.kind !== 'bookmark') return true
    if (b.type === 'ayah') {
      return featured.name !== b.label
    }
    return featured.name !== b.label
  }).slice(0, 4)

  return (
    <FadeInSection>
      <section className="relative overflow-hidden border-y border-hairline dark:border-dark-border bg-green-soft/40 dark:bg-dark-surface">
        <div
          className="pointer-events-none absolute -top-8 start-[8%] font-display-h1 text-[clamp(6rem,18vw,12rem)] leading-none text-secondary/10 dark:text-dark-green/15 select-none"
          aria-hidden="true"
        >
          &ldquo;
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(76,168,107,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_70%_20%,rgba(76,168,107,0.08),transparent_55%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 px-margin-mobile md:px-margin-desktop py-section-y max-w-screen-2xl mx-auto">
          <LocalizedLink
            to={featured.to}
            className="group block max-w-2xl mx-auto text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary dark:focus-visible:ring-dark-green focus-visible:ring-offset-4 focus-visible:ring-offset-green-soft dark:focus-visible:ring-offset-dark-surface rounded-sm"
          >
            <blockquote className="mb-8 md:mb-10">
              <p className="font-display-h1-mobile text-display-h1-mobile md:font-heading-h2 md:text-heading-h2 text-ink-black dark:text-dark-text leading-tight">
                {t('home.continueTitle')}
              </p>
              <p className="mt-4 font-body-lg text-body-lg text-ink-soft dark:text-dark-text-secondary max-w-md mx-auto">
                {t('home.continueSubtitle')}
              </p>
            </blockquote>

            <footer className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8">
              <div className="flex items-center gap-4 text-start">
                <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-full bg-paper-white dark:bg-dark-bg border border-hairline dark:border-dark-border shadow-sm flex items-center justify-center ring-4 ring-secondary/10 dark:ring-dark-green/15 transition-transform duration-300 group-hover:scale-[1.03]">
                  <span className="material-symbols-outlined text-3xl md:text-4xl text-secondary dark:text-dark-green" aria-hidden="true">
                    {featured.icon}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-body-lg text-body-lg font-medium text-ink-black dark:text-dark-text truncate">
                    {featured.name}
                  </p>
                  <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                    {featured.role}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block h-10 w-px bg-hairline dark:bg-dark-border" aria-hidden="true" />

              <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                <BrandLogo size="sm" linkTo={false} className="h-9 w-9" />
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary dark:text-dark-green">
                  {t('home.continueCta')}
                  <span className="material-symbols-outlined text-[18px] rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden="true">
                    arrow_forward
                  </span>
                </span>
              </div>
            </footer>
          </LocalizedLink>

          {secondaryBookmarks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-hairline/80 dark:border-dark-border max-w-2xl mx-auto">
              <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary uppercase tracking-widest text-center mb-4">
                {t('home.continueBookmarks')}
              </p>
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                {secondaryBookmarks.map((b) => (
                  <li key={b.type === 'ayah' ? `a-${b.surahId}-${b.ayah}` : `h-${b.collection}-${b.id}`}>
                    <LocalizedLink
                      to={
                        b.type === 'ayah'
                          ? `/quran/${b.surahId}`
                          : buildHadithReaderPath(b.collection, b.id)
                      }
                      className="inline-flex items-center gap-1.5 font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary hover:text-secondary dark:hover:text-dark-green transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">bookmark</span>
                      <span className="line-clamp-1 max-w-[14rem]">{b.label}</span>
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </FadeInSection>
  )
}
