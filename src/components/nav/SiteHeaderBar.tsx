import type { ReactNode, Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { NextPrayerBar, NextPrayerInline } from './NextPrayerBar'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ButtonLink } from '@/components/ui/Button'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { SUPPORTED_LANGUAGES } from '@/i18n/config'
import { MenuToggleIcon } from '@/components/nav/MenuToggleIcon'
import { cn } from '@/lib/utils/format'

interface SiteHeaderBarProps {
  onMenuClick: () => void
  /** Desktop mega-menu triggers (marketing only). */
  desktopNav?: ReactNode
  /** Content after the bar row (e.g. MegaMenu panel). */
  headerChildren?: ReactNode
  /** Show language shortcut from `lg` breakpoint (hidden on phone + tablet). */
  showLanguage?: boolean
  /** Hide hamburger when desktop nav takes over (`lg` for marketing). */
  hideMenuFrom?: 'lg'
  /** Hide logo / search / get app / menu row from this breakpoint (app desktop uses sidebar). */
  hideChromeFrom?: 'lg'
  /** Ref for the menu/close button (focus trap when used inside drawer). */
  menuButtonRef?: Ref<HTMLButtonElement>
  /** Override aria-label for the menu button. */
  menuAriaLabel?: string
  /** When true, animates hamburger into close (X). */
  menuOpen?: boolean
  /** When sticky is false, used inside the open mobile drawer. */
  sticky?: boolean
  /** Fired when search / get app / logo navigate (closes open drawer). */
  onNavigate?: () => void
}

export function SiteHeaderBar({
  onMenuClick,
  desktopNav,
  headerChildren,
  showLanguage = false,
  hideMenuFrom,
  hideChromeFrom,
  menuButtonRef,
  menuAriaLabel,
  menuOpen = false,
  sticky = true,
  onNavigate,
}: SiteHeaderBarProps) {
  const { t } = useTranslation()
  const menuLabel =
    menuAriaLabel ?? (menuOpen ? t('common.closeMenu') : t('common.openMenu'))
  const language = useSettingsStore((s) => s.language)
  const langLabel = SUPPORTED_LANGUAGES.find((l) => l.id === language)?.label ?? 'EN'

  return (
    <div className={cn(sticky && 'sticky top-0 z-50', !sticky && 'pt-safe')}>
      {/* Phone + desktop strip. Hidden only on tablet (md–lg) where the inline chip shows. */}
      <NextPrayerBar className="hidden max-md:block lg:block" />
      <header
        className={cn(
          'bg-surface dark:bg-dark-surface border-b border-hairline dark:border-dark-border transition-[background-color,border-color,box-shadow] duration-300',
          hideChromeFrom === 'lg' && 'lg:hidden',
        )}
      >
        <div className="flex h-16 items-center justify-between px-margin-mobile md:px-margin-desktop max-w-screen-2xl mx-auto">
          <BrandLogo size="md" showWordmark linkTo="/" />

          {desktopNav}

          {/* Tablet / iPad only — must not affect phone or desktop */}
          <NextPrayerInline className="hidden md:max-lg:flex" />

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <LocalizedLink
              to="/search"
              onClick={onNavigate}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-secondary hover:text-primary transition-colors dark:text-dark-green"
              aria-label={t('common.search')}
            >
              <span className="material-symbols-outlined">search</span>
            </LocalizedLink>
            {showLanguage ? (
              <LocalizedLink
                to="/settings"
                onClick={onNavigate}
                className="hidden lg:inline-flex min-h-11 items-center font-label-sm text-label-sm text-stone hover:text-secondary transition-colors max-w-[8rem] truncate dark:text-dark-text-secondary"
              >
                {langLabel}
              </LocalizedLink>
            ) : null}
            <ButtonLink to="/get_app" size="sm" className="inline-flex shrink-0" onClick={onNavigate}>
              {t('common.getApp')}
            </ButtonLink>
            <button
              type="button"
              ref={menuButtonRef}
              className={cn(
                'inline-flex min-h-11 min-w-11 items-center justify-center text-secondary dark:text-dark-green',
                hideMenuFrom === 'lg' && 'lg:hidden',
              )}
              onClick={onMenuClick}
              aria-label={menuLabel}
              aria-expanded={menuOpen}
            >
              <MenuToggleIcon open={menuOpen} />
            </button>
          </div>
        </div>
        {headerChildren}
      </header>
    </div>
  )
}
