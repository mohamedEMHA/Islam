export type SecurityLogEvent = 'rate_limited' | 'not_found'

export interface SecurityLogInput {
  event: SecurityLogEvent
  path: string
  status: number
  country?: string | null
  asn?: number | null
  userAgent?: string | null
}

export interface SecurityLogEntry {
  event: SecurityLogEvent
  path: string
  status: number
  country: string
  asn: number | null
  uaFamily: string
}

/** Coarse UA family for observability. Never log raw IP. */
export function uaFamily(userAgent: string | null | undefined): string {
  const ua = userAgent ?? ''
  if (!ua) return 'empty'
  if (ua.includes('curl/')) return 'curl'
  if (ua.includes('python-requests')) return 'python-requests'
  if (ua.includes('python-httpx')) return 'python-httpx'
  if (ua.includes('Go-http-client')) return 'go-http'
  if (ua.includes('HeadlessChrome')) return 'headless-chrome'
  if (ua.includes('Chrome/')) return 'chrome'
  if (ua.includes('Firefox/')) return 'firefox'
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'safari'
  if (ua.includes('bot') || ua.includes('Bot')) return 'bot'
  return 'other'
}

export function buildSecurityLog(input: SecurityLogInput): SecurityLogEntry {
  return {
    event: input.event,
    path: input.path,
    status: input.status,
    country: input.country || 'ZZ',
    asn: input.asn ?? null,
    uaFamily: uaFamily(input.userAgent),
  }
}

export function logSecurityEvent(input: SecurityLogInput): void {
  console.log(JSON.stringify(buildSecurityLog(input)))
}
