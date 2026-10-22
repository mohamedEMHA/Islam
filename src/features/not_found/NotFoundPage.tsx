import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'
import { MarketingNav } from '@/components/nav/MarketingNav'
import { usePageMeta } from '@/lib/hooks/usePageMeta'
import { LocalizedLink } from '@/components/routing/LocalizedLink'

export function NotFoundPage() {
  const { t } = useTranslation()

  usePageMeta({
    title: t('pages.notFound.title'),
    description: t('pages.notFound.subtitle'),
    path: '/404',
    noIndex: true,
  })

  return (
    <div className="min-h-dvh flex flex-col bg-surface-container-low dark:bg-dark-bg text-ink-black dark:text-dark-text">
      <MarketingNav />

      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-16 text-center"
      >
        <p className="font-label-sm text-label-sm uppercase tracking-widest text-stone dark:text-dark-text-secondary mb-3">
          404
        </p>
        <span
          className="material-symbols-outlined text-5xl text-secondary dark:text-dark-green mb-4"
          aria-hidden
        >
          explore_off
        </span>
        <h1 className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-text mb-3">
          {t('pages.notFound.title')}
        </h1>
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-8 max-w-md">
          {t('pages.notFound.subtitle')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to="/" size="lg">
            {t('pages.notFound.goHome')}
          </ButtonLink>
          <ButtonLink to="/prayer_times" variant="secondary" size="lg">
            {t('common.startJourney')}
          </ButtonLink>
        </div>
        <nav
          className="mt-10 flex flex-wrap justify-center gap-4 font-label-sm text-label-sm"
          aria-label={t('pages.notFound.helpfulLinks')}
        >
          <LocalizedLink
            to="/quran"
            className="min-h-11 inline-flex items-center text-secondary dark:text-dark-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-sm"
          >
            {t('nav.items.quran')}
          </LocalizedLink>
          <LocalizedLink
            to="/search"
            className="min-h-11 inline-flex items-center text-secondary dark:text-dark-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-sm"
          >
            {t('nav.items.search')}
          </LocalizedLink>
          <LocalizedLink
            to="/privacy"
            className="min-h-11 inline-flex items-center text-secondary dark:text-dark-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-sm"
          >
            {t('footer.privacy')}
          </LocalizedLink>
        </nav>
      </main>
    </div>
  )
}
