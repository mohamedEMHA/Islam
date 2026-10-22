import { m as motion, useReducedMotion } from 'framer-motion'
import { LocalizedNavLink } from '@/components/routing/LocalizedLink'
import { useTranslatedNav } from '@/lib/hooks/useTranslatedNav'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { LegalFooterLinks } from '@/components/nav/LegalFooterLinks'
import { cn } from '@/lib/utils/format'
import { easeOutSoft } from '@/lib/motion'

export function AppSidebar() {
  const { groups, utilityLinks } = useTranslatedNav()
  const reduceMotion = useReducedMotion()

  return (
    <nav className="hidden lg:flex fixed start-0 top-9 h-[calc(100dvh-2.25rem)] w-80 flex-col p-6 z-40 bg-paper-white dark:bg-dark-surface border-e border-hairline dark:border-dark-border">
      <div className="mb-6 flex justify-center">
        <BrandLogo
          size="md"
          showWordmark
          linkTo="/"
          linkClassName="justify-center"
          className="object-center mx-auto"
        />
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {utilityLinks.map((item) => (
          <LocalizedNavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-2 rounded-lg px-4 py-2.5 min-h-11 font-label-sm text-label-sm min-w-0',
                'transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]',
                isActive
                  ? 'text-secondary dark:text-dark-green'
                  : 'text-stone border border-hairline hover:bg-cream-deep hover:text-secondary dark:border-dark-border dark:hover:bg-dark-surface',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !reduceMotion ? (
                  <motion.span
                    layoutId="sidebar-utility-active"
                    className="absolute inset-0 rounded-lg bg-green-soft dark:bg-dark-green/20"
                    transition={easeOutSoft}
                  />
                ) : null}
                {isActive && reduceMotion ? (
                  <span className="absolute inset-0 rounded-lg bg-green-soft dark:bg-dark-green/20" />
                ) : null}
                <span className="material-symbols-outlined text-[18px] shrink-0 relative z-10">{item.icon}</span>
                <span className="truncate relative z-10">{item.label}</span>
              </>
            )}
          </LocalizedNavLink>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pe-1 thin-scrollbar">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary uppercase tracking-widest mb-2 px-2 truncate">
              {group.label}
            </p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.path + item.label}>
                  <LocalizedNavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'sidebar-link relative min-w-0',
                        isActive
                          ? 'text-secondary dark:text-dark-green'
                          : 'text-stone hover:bg-cream-deep dark:hover:bg-dark-surface',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !reduceMotion ? (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-lg bg-green-soft dark:bg-dark-green/20"
                            transition={easeOutSoft}
                          />
                        ) : null}
                        {isActive && reduceMotion ? (
                          <span className="absolute inset-0 rounded-lg bg-green-soft dark:bg-dark-green/20" />
                        ) : null}
                        <span
                          className={cn(
                            'material-symbols-outlined text-[20px] shrink-0 relative z-10',
                            isActive && 'fill',
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate relative z-10">{item.label}</span>
                      </>
                    )}
                  </LocalizedNavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <LegalFooterLinks className="mt-auto" />
    </nav>
  )
}
