export {
  absoluteUrl,
  hreflangAlternates,
  parseLocalePath,
  localizedPath,
  SITE_URL,
} from '@/lib/i18n/localizedPath'

const DEFAULT_SITE_URL = 'https://islam.house'

export function getSiteUrlCompat(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return DEFAULT_SITE_URL
}
