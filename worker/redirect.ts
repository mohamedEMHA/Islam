const APEX_HOST = 'islam.house'
const WWW_HOST = 'www.islam.house'

/** Pure helper for www → apex 301. Exported for unit tests. */
export function apexRedirectUrl(requestUrl: string): string | null {
  const url = new URL(requestUrl)
  if (url.hostname !== WWW_HOST) return null
  return `https://${APEX_HOST}${url.pathname}${url.search}`
}
