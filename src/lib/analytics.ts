const SCRIPT_ID = 'islam-analytics-script'

function isCloudflareStorageKey(key: string): boolean {
  return key.startsWith('_cf') || key.startsWith('cf_') || key.includes('cloudflareinsights')
}

function clearCloudflareStorage(): void {
  if (typeof window === 'undefined') return
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const keys: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && isCloudflareStorageKey(key)) {
          keys.push(key)
        }
      }
      for (const key of keys) {
        storage.removeItem(key)
      }
    } catch {
      // ignore storage access errors (private mode, blocked storage)
    }
  }
}

export function getAnalyticsToken(): string | undefined {
  const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN
  return typeof token === 'string' && token.trim() ? token.trim() : undefined
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(getAnalyticsToken())
}

export function loadAnalytics(): void {
  if (typeof document === 'undefined') return
  const token = getAnalyticsToken()
  if (!token) return
  if (document.getElementById(SCRIPT_ID)) return

  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.defer = true
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.setAttribute('data-cf-beacon', JSON.stringify({ token }))
  document.head.appendChild(script)
}

export function unloadAnalytics(): void {
  if (typeof document === 'undefined') return
  document.getElementById(SCRIPT_ID)?.remove()
  clearCloudflareStorage()
  // Cloudflare beacon may still hold first-party cookies until the next full page load.
}
