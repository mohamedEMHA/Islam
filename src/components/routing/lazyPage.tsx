import { lazy, Suspense, type ComponentType } from 'react'
import { RouteFallback } from '@/components/routing/RouteFallback'

type LazyPageComponent<P extends object> = ((props: P) => React.JSX.Element) & {
  preload: () => Promise<void>
}

export function lazyPage<P extends object>(
  factory: () => Promise<Record<string, ComponentType<P>>>,
  exportName: string,
): LazyPageComponent<P> {
  const load = () =>
    factory().then((module) => ({ default: module[exportName] as ComponentType<P> }))

  const Lazy = lazy(load)

  function LazyPage(props: P) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Lazy {...props} />
      </Suspense>
    )
  }

  LazyPage.preload = async () => {
    await load()
  }

  return LazyPage
}

/** Prefetch core app chunks during idle time after first paint. */
export function preloadCoreRoutes(
  pages: Array<{ preload: () => Promise<void> }>,
): void {
  if (typeof navigator !== 'undefined') {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }).connection
    if (connection?.saveData) return
    if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') return
  }

  const run = () => {
    void Promise.allSettled(pages.map((page) => page.preload()))
  }

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => run(), { timeout: 4000 })
  } else {
    setTimeout(run, 1500)
  }
}
