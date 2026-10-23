import { useEffect } from 'react'
import { m as motion, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation, useMatches } from 'react-router-dom'
import { CookieConsentBanner } from '@/components/privacy/CookieConsentBanner'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { MobileMegaMenu } from '@/components/nav/MegaMenu'
import { layoutEnter } from '@/lib/motion'
import { useLanguageFromUrl } from '@/lib/hooks/useLanguageFromUrl'
import { useMobileNavStore } from '@/lib/stores/mobileNavStore'
import { scrollWindowToTop } from '@/lib/utils/scroll'

const BASE_LAYOUT_IDS = new Set(['marketing', 'onboarding', 'app', 'embed'])

function baseLayoutId(id: string): string {
  return id.replace(/^(ar|ur|id|fr)-/, '')
}

/** Shared shell so global UI (consent + mobile menu) stays inside router context. */
export function RootLayout() {
  const location = useLocation()
  const matches = useMatches()
  const reduceMotion = useReducedMotion()
  useLanguageFromUrl()
  const layoutId =
    matches.map((m) => baseLayoutId(m.id)).find((id) => BASE_LAYOUT_IDS.has(id)) ?? 'root'

  const menuOpen = useMobileNavStore((s) => s.open)
  const closeMenu = useMobileNavStore((s) => s.closeMenu)

  useEffect(() => {
    try {
      window.history.scrollRestoration = 'manual'
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    closeMenu()
  }, [location.pathname, closeMenu])

  // Always start at top on route change (including back/forward). Hash links keep native jump.
  useEffect(() => {
    if (location.hash) return
    scrollWindowToTop()
    const frame = window.requestAnimationFrame(scrollWindowToTop)
    // Lazy routes paint after the first frame; a short follow-up keeps the top.
    const timer = window.setTimeout(scrollWindowToTop, 100)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [location.pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const url = new URL(anchor.href, window.location.origin)
      if (url.origin !== window.location.origin) return
      if (url.hash) return
      if (url.pathname !== location.pathname) return
      if (url.search !== location.search) return

      scrollWindowToTop()
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [location.pathname, location.search])

  const outlet = (
    <ErrorBoundary resetKey={location.pathname}>
      <Outlet />
    </ErrorBoundary>
  )

  const content = reduceMotion ? (
    outlet
  ) : (
    <motion.div key={layoutId} variants={layoutEnter} initial="initial" animate="animate">
      {outlet}
    </motion.div>
  )

  const isEmbed = layoutId === 'embed'

  return (
    <>
      {content}
      {!isEmbed && <MobileMegaMenu open={menuOpen} onClose={closeMenu} />}
      {!isEmbed && <CookieConsentBanner />}
    </>
  )
}
