import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { FadeInSection } from '@/components/motion/FadeInSection'

export function InstallCtaSection() {
  const { t } = useTranslation()

  return (
    <FadeInSection>
      <section className="px-margin-mobile md:px-margin-desktop py-section-y max-w-screen-2xl mx-auto">
        <div className="rounded-xl border border-hairline dark:border-dark-border bg-surface dark:bg-dark-surface p-6 md:p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-secondary dark:text-dark-green mb-4 block">
            schedule
          </span>
          <h2 className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-text mb-3">
            {t('home.installTitle')}
          </h2>
          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-6 max-w-xl mx-auto">
            {t('home.installSubtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LocalizedLink
              to="/get_app"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 transition-opacity"
            >
              {t('pages.getApp.comingSoon')}
            </LocalizedLink>
            <LocalizedLink
              to="/prayer_times"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-hairline dark:border-dark-border font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary hover:border-secondary dark:hover:border-dark-green transition-colors"
            >
              {t('common.openApp')}
            </LocalizedLink>
          </div>
        </div>
      </section>
    </FadeInSection>
  )
}
