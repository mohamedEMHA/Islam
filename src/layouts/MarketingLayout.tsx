import { useTranslation } from 'react-i18next'
import { MarketingNav } from '@/components/nav/MarketingNav'
import { MarketingFooter } from '@/components/nav/MarketingFooter'
import { RouteTransition } from '@/components/motion/RouteTransition'

export function MarketingLayout() {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh flex flex-col bg-surface-container-low text-ink-black dark:bg-dark-bg dark:text-dark-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-container focus:text-paper-white focus:rounded"
      >
        {t('common.skipToContent')}
      </a>
      <MarketingNav />
      <main id="main-content" className="flex-1 min-w-0">
        <RouteTransition />
      </main>
      <MarketingFooter />
    </div>
  )
}
