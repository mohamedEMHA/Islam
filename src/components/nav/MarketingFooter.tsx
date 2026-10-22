import { useTranslation } from 'react-i18next'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { ButtonLink } from '@/components/ui/Button'
import { LocalizedLink, useLocale } from '@/components/routing/LocalizedLink'
import { useTranslatedNav } from '@/lib/hooks/useTranslatedNav'
import { useIsAppLayout } from '@/lib/hooks/useIsAppLayout'
import { ALL_LOCALES, localizedPath, type LocaleCode } from '@/lib/i18n/localizedPath'

const LEGAL_PATHS = new Set(['/terms', '/privacy', '/sources'])

const footerLinkClassName =
  'inline-block text-sm text-ink-soft hover:text-secondary dark:text-dark-text-secondary dark:hover:text-dark-green transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-soft)] rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-low dark:focus-visible:ring-offset-dark-bg'

function resolveFooterPath(path: string, isApp: boolean): string {
  if (!isApp || !LEGAL_PATHS.has(path)) return path
  return `/app${path}`
}

const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
  id: 'Indonesia',
  fr: 'Français',
}

export function MarketingFooter() {
  const { t } = useTranslation()
  const { footerGroups } = useTranslatedNav()
  const isApp = useIsAppLayout()
  const locale = useLocale()

  return (
    <footer className="mt-auto border-t border-hairline dark:border-dark-border bg-surface-container-low dark:bg-dark-bg">
      <div className="max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="pt-10 md:pt-12 lg:pt-14">
          <div className="flex flex-col gap-10 lg:gap-12 pb-8 md:pb-10 border-b border-hairline/80 dark:border-dark-border/80">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 md:gap-5 max-w-xl">
                <BrandLogo size="xl" showWordmark linkTo="/" />
                <div className="min-w-0 pt-0.5">
                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary leading-relaxed">
                    {t('footer.blurb')}
                  </p>
                  <p className="mt-2 font-label-sm text-label-sm text-stone/80 dark:text-dark-text-secondary/80">
                    {t('app.tagline')}
                  </p>
                </div>
              </div>
              <ButtonLink to="/get_app" size="sm" className="self-start lg:self-auto shrink-0">
                {t('common.getApp')}
              </ButtonLink>
            </div>

            <nav
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10"
              aria-label={t('footer.navigation')}
            >
              {footerGroups.map((group) => (
                <section key={group.id} aria-labelledby={`footer-heading-${group.id}`}>
                  <h2
                    id={`footer-heading-${group.id}`}
                    className="font-label-sm text-label-sm uppercase tracking-widest text-stone dark:text-dark-text-secondary mb-4"
                  >
                    {group.label}
                  </h2>
                  <ul className="space-y-2.5">
                    {group.items.map((item) => {
                      const to = resolveFooterPath(item.path, isApp)
                      return (
                        <li key={item.path}>
                          <LocalizedLink to={to} className={footerLinkClassName}>
                            {item.label}
                          </LocalizedLink>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </nav>

            <nav aria-label={t('common.languages')} className="flex flex-wrap gap-3">
              {ALL_LOCALES.map((code) => (
                <a
                  key={code}
                  href={localizedPath('/', code)}
                  hrefLang={code}
                  className={
                    code === locale
                      ? 'text-sm font-medium text-secondary dark:text-dark-green'
                      : footerLinkClassName
                  }
                >
                  {LOCALE_LABELS[code]}
                </a>
              ))}
            </nav>
          </div>

          <div className="pt-5 pb-4 md:pt-6 md:pb-5 text-center">
            <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
              © {new Date().getFullYear()} {t('app.name')}. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
