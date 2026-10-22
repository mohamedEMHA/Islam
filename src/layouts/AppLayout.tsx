import { useTranslation } from 'react-i18next'
import { AppSidebar } from '@/components/nav/AppSidebar'
import { MarketingFooter } from '@/components/nav/MarketingFooter'
import { SiteHeaderBar } from '@/components/nav/SiteHeaderBar'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { usePrayerNotifications } from '@/lib/hooks/usePrayerNotifications'
import { RouteTransition } from '@/components/motion/RouteTransition'
import { useMobileNavStore } from '@/lib/stores/mobileNavStore'

export function AppLayout() {
  const { t } = useTranslation()
  const menuOpen = useMobileNavStore((s) => s.open)
  const openMenu = useMobileNavStore((s) => s.openMenu)
  const closeMenu = useMobileNavStore((s) => s.closeMenu)
  usePrayerNotifications()

  return (
    <div className="min-h-dvh bg-surface dark:bg-dark-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-container focus:text-paper-white focus:rounded"
      >
        {t('common.skipToContent')}
      </a>
      <OfflineBanner />

      <SiteHeaderBar
        onMenuClick={menuOpen ? closeMenu : openMenu}
        menuOpen={menuOpen}
        hideMenuFrom="lg"
        hideChromeFrom="lg"
      />
      <AppSidebar />

      <main id="main-content" className="lg:ms-80 min-h-dvh flex flex-col min-w-0">
        <div className="flex-1">
          <RouteTransition />
        </div>
        <MarketingFooter />
      </main>
    </div>
  )
}
