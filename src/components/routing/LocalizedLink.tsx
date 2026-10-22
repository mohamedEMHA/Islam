import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Link, NavLink, useLocation, type NavLinkProps } from 'react-router-dom'
import { localizedPath, parseLocalePath, type LocaleCode } from '@/lib/i18n/localizedPath'

function resolveTo(to: string, locale: LocaleCode): string {
  if (to.startsWith('http://') || to.startsWith('https://') || to.startsWith('mailto:')) {
    return to
  }
  const hashIndex = to.indexOf('#')
  const hash = hashIndex >= 0 ? to.slice(hashIndex) : ''
  const withoutHash = hashIndex >= 0 ? to.slice(0, hashIndex) : to
  const [pathname, search = ''] = withoutHash.split('?')
  // Strip any existing locale prefix so we never double-prefix
  const { pathWithoutLocale } = parseLocalePath(pathname || '/')
  const localized = localizedPath(pathWithoutLocale, locale)
  const query = search ? `?${search}` : ''
  return `${localized}${query}${hash}`
}

export function useLocale(): LocaleCode {
  const { pathname } = useLocation()
  return parseLocalePath(pathname).locale
}

/** React Router Link that prefixes the current locale. */
export const LocalizedLink = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentPropsWithoutRef<typeof Link>, 'to'> & { to: string }
>(function LocalizedLink({ to, ...rest }, ref) {
  const locale = useLocale()
  return <Link ref={ref} to={resolveTo(to, locale)} {...rest} />
})

export function LocalizedNavLink({
  to,
  ...rest
}: Omit<NavLinkProps, 'to'> & { to: string }) {
  const locale = useLocale()
  return <NavLink to={resolveTo(to, locale)} {...rest} />
}

export function useLocalizedNavigatePath(): (path: string) => string {
  const locale = useLocale()
  return (path: string) => resolveTo(path, locale)
}
