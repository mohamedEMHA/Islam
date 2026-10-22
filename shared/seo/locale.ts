export const SITE_URL = 'https://islam.house'

export const DEFAULT_LOCALE = 'en' as const

export const LOCALE_PREFIXES = ['ar', 'ur', 'id', 'fr'] as const

export type PrefixedLocale = (typeof LOCALE_PREFIXES)[number]

export type LocaleCode = typeof DEFAULT_LOCALE | PrefixedLocale

export const ALL_LOCALES: readonly LocaleCode[] = [
  DEFAULT_LOCALE,
  ...LOCALE_PREFIXES,
] as const

export const RTL_LOCALES = new Set<LocaleCode>(['ar', 'ur'])

const PREFIX_SET = new Set<string>(LOCALE_PREFIXES)

export function isLocaleCode(value: string): value is LocaleCode {
  return value === DEFAULT_LOCALE || PREFIX_SET.has(value)
}

export function isPrefixedLocale(value: string): value is PrefixedLocale {
  return PREFIX_SET.has(value)
}

export function getLanguageDirection(locale: LocaleCode): 'rtl' | 'ltr' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
}

/** Normalize path to always start with `/` and never end with `/` except root. */
export function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  const withSlash = path.startsWith('/') ? path : `/${path}`
  return withSlash.replace(/\/+$/, '') || '/'
}

export interface ParsedLocalePath {
  locale: LocaleCode
  pathWithoutLocale: string
}

/** Strip optional `/ar|/ur|/id|/fr` prefix from a pathname. */
export function parseLocalePath(pathname: string): ParsedLocalePath {
  const normalized = normalizePath(pathname)
  const segments = normalized.split('/').filter(Boolean)
  if (segments.length === 0) {
    return { locale: DEFAULT_LOCALE, pathWithoutLocale: '/' }
  }
  const first = segments[0]
  if (isPrefixedLocale(first)) {
    const rest = segments.slice(1)
    return {
      locale: first,
      pathWithoutLocale: rest.length === 0 ? '/' : `/${rest.join('/')}`,
    }
  }
  return { locale: DEFAULT_LOCALE, pathWithoutLocale: normalized }
}

/** Build a locale-aware path. English stays unprefixed (`x-default`). */
export function localizedPath(path: string, locale: LocaleCode): string {
  const clean = normalizePath(path)
  if (locale === DEFAULT_LOCALE) return clean
  if (clean === '/') return `/${locale}`
  return `/${locale}${clean}`
}

export interface HreflangAlternate {
  hreflang: string
  href: string
}

/** Absolute hreflang alternates including `x-default` (English, unprefixed). */
export function hreflangAlternates(
  pathWithoutLocale: string,
  siteUrl: string = SITE_URL,
): HreflangAlternate[] {
  const clean = normalizePath(pathWithoutLocale)
  const base = siteUrl.replace(/\/$/, '')
  const alternates: HreflangAlternate[] = ALL_LOCALES.map((locale) => ({
    hreflang: locale,
    href: `${base}${localizedPath(clean, locale)}`,
  }))
  alternates.push({
    hreflang: 'x-default',
    href: `${base}${localizedPath(clean, DEFAULT_LOCALE)}`,
  })
  return alternates
}

export function absoluteUrl(path: string, siteUrl: string = SITE_URL): string {
  const base = siteUrl.replace(/\/$/, '')
  const clean = normalizePath(path)
  return clean === '/' ? `${base}/` : `${base}${clean}`
}
