import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { MegaMenu, MegaMenuTrigger } from './MegaMenu'
import { SiteHeaderBar } from './SiteHeaderBar'
import { useTranslatedNav } from '@/lib/hooks/useTranslatedNav'
import { useMobileNavStore } from '@/lib/stores/mobileNavStore'

export function MarketingNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { t } = useTranslation()
  const { groups } = useTranslatedNav()
  const menuOpen = useMobileNavStore((s) => s.open)
  const openMenu = useMobileNavStore((s) => s.openMenu)
  const closeMenu = useMobileNavStore((s) => s.closeMenu)

  const handleToggle = (id: string) => {
    setActiveMenu((prev) => (prev === id ? null : id))
  }

  return (
    <SiteHeaderBar
      onMenuClick={menuOpen ? closeMenu : openMenu}
      menuOpen={menuOpen}
      showLanguage
      hideMenuFrom="lg"
      desktopNav={
        <nav className="hidden lg:flex items-center gap-4 xl:gap-8" aria-label={t('common.mainNavigation')}>
          {groups.map((group) => (
            <MegaMenuTrigger
              key={group.id}
              id={group.id}
              label={group.label}
              isOpen={activeMenu === group.id}
              onToggle={handleToggle}
            />
          ))}
        </nav>
      }
      headerChildren={<MegaMenu activeGroupId={activeMenu} onClose={() => setActiveMenu(null)} />}
    />
  )
}
