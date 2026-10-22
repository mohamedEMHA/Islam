/** Force window to the top. Prefer over smooth scroll for reliable mobile SPA nav. */
export function scrollWindowToTop(): void {
  if (typeof window === 'undefined') return
  try {
    window.history.scrollRestoration = 'manual'
  } catch {
    // ignore
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}
