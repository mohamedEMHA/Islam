import { describe, expect, it } from 'vitest'
import {
  clientIp,
  isAllowedProxyContentType,
  isSafeRelativePath,
  matchProxyRoute,
  validateUmmahPost,
} from '../../worker/allowlist'
import { SECURITY_HEADERS } from '../../worker/securityHeaders'

describe('worker proxy allowlist', () => {
  it('allows sunnah collection book routes', () => {
    expect(matchProxyRoute('GET', '/api/sunnah/collections/bukhari/books', '')).toEqual({
      service: 'sunnah',
      rest: '/collections/bukhari/books',
      search: '',
    })
    expect(
      matchProxyRoute('GET', '/api/sunnah/collections/bukhari/books/1/hadiths', '?limit=20'),
    ).toEqual({
      service: 'sunnah',
      rest: '/collections/bukhari/books/1/hadiths',
      search: '?limit=20',
    })
  })

  it('rejects unknown sunnah paths and methods', () => {
    expect(matchProxyRoute('GET', '/api/sunnah/admin', '')).toBe('not_found')
    expect(matchProxyRoute('POST', '/api/sunnah/collections/bukhari/books', '')).toBe(
      'method_not_allowed',
    )
    expect(matchProxyRoute('GET', '/api/sunnah/http://evil.com', '')).toBe('invalid_path')
  })

  it('allows ummah routes used by the client', () => {
    expect(matchProxyRoute('GET', '/api/ummah/names', '?page=1')).toEqual({
      service: 'ummah',
      rest: '/names',
      search: '?page=1',
    })
    expect(matchProxyRoute('POST', '/api/ummah/zakat/calculate', '')).toEqual({
      service: 'ummah',
      rest: '/zakat/calculate',
      search: '',
    })
    expect(matchProxyRoute('GET', '/api/ummah/quran/surah/1/ayah/1', '')).toEqual({
      service: 'ummah',
      rest: '/quran/surah/1/ayah/1',
      search: '',
    })
  })

  it('rejects gold and unknown api routes', () => {
    expect(matchProxyRoute('GET', '/api/gold/XAU/USD', '')).toBe('not_found')
    expect(matchProxyRoute('GET', '/api/unknown', '')).toBe('not_found')
  })

  it('allows aloula channel routes only', () => {
    expect(matchProxyRoute('GET', '/api/aloula/api/v1/channels', '')).toEqual({
      service: 'aloula',
      rest: '/api/v1/channels',
      search: '',
    })
    expect(matchProxyRoute('GET', '/api/aloula/api/v1.1/channels/12/player', '')).toEqual({
      service: 'aloula',
      rest: '/api/v1.1/channels/12/player',
      search: '',
    })
    expect(matchProxyRoute('GET', '/api/aloula/api/v1/secret', '')).toBe('not_found')
  })

  it('allows kwikmotion HD live host in connect-src CSP', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy']!
    expect(csp).toContain('https://live.kwikmotion.com')
    expect(csp).toContain('https://cdn-globecast.akamaized.net')
  })

  it('allows www.mp3quran.net in connect-src CSP', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy']!
    expect(csp).toContain('https://www.mp3quran.net')
    expect(csp).toContain('https://mp3quran.net')
  })

  it('allows Qurango and RadioJar stream hosts in connect-src CSP', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy']!
    expect(csp).toContain('https://backup.qurango.net')
    expect(csp).toContain('https://stream.radiojar.com')
  })

  it('validates relative paths', () => {
    expect(isSafeRelativePath('/collections/bukhari')).toBe(true)
    expect(isSafeRelativePath('../etc/passwd')).toBe(false)
    expect(isSafeRelativePath('https://evil.com')).toBe(false)
  })

  it('allowlists query params per service', () => {
    expect(matchProxyRoute('GET', '/api/sunnah/collections/bukhari/books/1/hadiths', '?limit=20&offset=0')).toEqual({
      service: 'sunnah',
      rest: '/collections/bukhari/books/1/hadiths',
      search: '?limit=20&offset=0',
    })
    expect(matchProxyRoute('GET', '/api/sunnah/collections/bukhari/books/1/hadiths', '?limit=20&evil=1')).toEqual({
      service: 'sunnah',
      rest: '/collections/bukhari/books/1/hadiths',
      search: '?limit=20',
    })
    expect(matchProxyRoute('GET', '/api/ummah/names', '?page=1&gender=male&callback=x')).toEqual({
      service: 'ummah',
      rest: '/names',
      search: '?gender=male&page=1',
    })
    expect(matchProxyRoute('GET', '/api/aloula/api/v1/channels', '?foo=1')).toEqual({
      service: 'aloula',
      rest: '/api/v1/channels',
      search: '',
    })
  })

  it('allowlists upstream proxy content types', () => {
    expect(isAllowedProxyContentType('application/json')).toBe(true)
    expect(isAllowedProxyContentType('application/json; charset=utf-8')).toBe(true)
    expect(isAllowedProxyContentType('application/vnd.apple.mpegurl')).toBe(true)
    expect(isAllowedProxyContentType('text/html')).toBe(false)
    expect(isAllowedProxyContentType('text/html; charset=utf-8')).toBe(false)
    expect(isAllowedProxyContentType(null)).toBe(false)
  })

  it('reads client IP only from CF-Connecting-IP', () => {
    expect(
      clientIp(
        new Request('https://islam.house/api/sunnah/collections', {
          headers: {
            'CF-Connecting-IP': '1.2.3.4',
            'X-Forwarded-For': '9.9.9.9',
          },
        }),
      ),
    ).toBe('1.2.3.4')
    expect(
      clientIp(
        new Request('https://islam.house/api/sunnah/collections', {
          headers: { 'X-Forwarded-For': '9.9.9.9' },
        }),
      ),
    ).toBe('unknown')
  })

  it('rejects oversized or non-json ummah POST bodies', () => {
    expect(
      validateUmmahPost(
        new Request('https://islam.house/api/ummah/zakat/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': '100' },
          body: '{}',
        }),
      ),
    ).toBeNull()
    expect(
      validateUmmahPost(
        new Request('https://islam.house/api/ummah/zakat/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain', 'Content-Length': '10' },
          body: 'not-json',
        }),
      ),
    ).toBe(415)
    expect(
      validateUmmahPost(
        new Request('https://islam.house/api/ummah/zakat/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': '5000' },
          body: '{}',
        }),
      ),
    ).toBe(413)
  })
})
