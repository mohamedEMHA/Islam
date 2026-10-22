import { LocalizedNavLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { APP_LEGAL_LINK_DEFS } from '@/lib/navConfig'
import { cn } from '@/lib/utils/format'

interface LegalFooterLinksProps {
  className?: string
  onNavigate?: () => void
}

export function LegalFooterLinks({ className, onNavigate }: LegalFooterLinksProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'pt-6 border-t border-hairline dark:border-dark-border flex justify-between gap-4 px-2',
        className,
      )}
    >
      {APP_LEGAL_LINK_DEFS.map((item) => (
        <LocalizedNavLink
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1 font-label-sm text-label-sm transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]',
              isActive
                ? 'text-secondary dark:text-dark-green'
                : 'text-stone hover:text-ink-soft dark:text-dark-text-secondary dark:hover:text-dark-text',
            )
          }
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden>
            {item.icon}
          </span>
          {t(item.labelKey)}
        </LocalizedNavLink>
      ))}
    </div>
  )
}
