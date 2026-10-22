import { useMatches } from 'react-router-dom'
import { localizedPath } from '@/lib/i18n/localizedPath'
import { useLocale } from '@/components/routing/LocalizedLink'

function isAppLayoutId(id: string): boolean {
  return id === 'app' || id.endsWith('-app')
}

/** True when the active route tree includes the AppLayout. */
export function useIsAppLayout(): boolean {
  const matches = useMatches()
  return matches.some((m) => isAppLayoutId(m.id))
}

/** Resolve a marketing legal path to the app-scoped equivalent when inside AppLayout. */
export function useLegalPath(path: '/terms' | '/privacy' | '/sources'): string {
  const isApp = useIsAppLayout()
  const locale = useLocale()
  const target = !isApp ? path : `/app${path}`
  return localizedPath(target, locale)
}
