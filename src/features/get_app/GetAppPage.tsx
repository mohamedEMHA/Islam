import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { ButtonLink } from '@/components/ui/Button'

export function GetAppPage() {
  const { t } = useTranslation()

  return (
    <PageShell title={t('pages.getApp.title')} subtitle={t('pages.getApp.subtitle')}>
      <HoverCard className="mx-auto max-w-lg text-center py-12 px-6 md:py-14">
        <span className="material-symbols-outlined text-5xl text-secondary dark:text-dark-green mb-4 block">
          schedule
        </span>
        <p className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-3">
          {t('pages.getApp.comingSoon')}
        </p>
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-8 leading-relaxed">
          {t('pages.getApp.comingSoonMessage')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <ButtonLink to="/prayer_times" size="lg">
            {t('common.openApp')}
          </ButtonLink>
          <Link
            to="/"
            className="min-h-11 inline-flex items-center font-label-sm text-label-sm text-stone hover:text-secondary dark:text-dark-text-secondary dark:hover:text-dark-green transition-colors"
          >
            {t('common.back')}
          </Link>
        </div>
      </HoverCard>
    </PageShell>
  )
}
