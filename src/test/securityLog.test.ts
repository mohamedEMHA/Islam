import { describe, expect, it } from 'vitest'
import { buildSecurityLog, uaFamily } from '../../worker/securityLog'

describe('securityLog', () => {
  it('classifies common user agent families', () => {
    expect(uaFamily('Mozilla/5.0 Chrome/156.0.0.0')).toBe('chrome')
    expect(uaFamily('curl/8.0')).toBe('curl')
    expect(uaFamily('')).toBe('empty')
    expect(uaFamily('python-requests/2.31')).toBe('python-requests')
  })

  it('builds structured log without IP', () => {
    const entry = buildSecurityLog({
      event: 'rate_limited',
      path: '/api/sunnah/collections',
      status: 429,
      country: 'US',
      asn: 16509,
      userAgent: 'curl/8.0',
    })
    expect(entry.event).toBe('rate_limited')
    expect(entry.path).toBe('/api/sunnah/collections')
    expect(entry.status).toBe(429)
    expect(entry.country).toBe('US')
    expect(entry.asn).toBe(16509)
    expect(entry.uaFamily).toBe('curl')
    expect(JSON.stringify(entry)).not.toMatch(/ip/i)
  })
})
