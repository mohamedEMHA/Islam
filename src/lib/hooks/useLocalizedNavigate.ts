import { useCallback } from 'react'
import { useNavigate, type NavigateOptions } from 'react-router-dom'
import {
  localizedPath,
  parseLocalePath,
  type LocaleCode,
} from '@/lib/i18n/localizedPath'
import { useLocale } from '@/components/routing/LocalizedLink'

/** Navigate while preserving the current locale URL prefix. */
export function useLocalizedNavigate() {
  const navigate = useNavigate()
  const locale = useLocale()

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      if (to.startsWith('http://') || to.startsWith('https://')) {
        navigate(to, options)
        return
      }
      const hashIndex = to.indexOf('#')
      const hash = hashIndex >= 0 ? to.slice(hashIndex) : ''
      const withoutHash = hashIndex >= 0 ? to.slice(0, hashIndex) : to
      const [pathname, search = ''] = withoutHash.split('?')
      const localized = localizedPath(pathname || '/', locale)
      const query = search ? `?${search}` : ''
      navigate(`${localized}${query}${hash}`, options)
    },
    [navigate, locale],
  )
}

/** Swap only the locale prefix, keeping the rest of the path. */
export function switchLocalePath(pathname: string, nextLocale: LocaleCode): string {
  const { pathWithoutLocale } = parseLocalePath(pathname)
  return localizedPath(pathWithoutLocale, nextLocale)
}
