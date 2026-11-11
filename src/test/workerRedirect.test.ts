import { describe, expect, it } from 'vitest'
import { apexRedirectUrl, httpsRedirectUrl } from '../../worker/redirect'

describe('www to apex redirect', () => {
  it('redirects www host preserving path and query', () => {
    expect(apexRedirectUrl('https://www.islam.house/quran?x=1')).toBe(
      'https://islam.house/quran?x=1',
    )
    expect(apexRedirectUrl('https://www.islam.house/prayer_times')).toBe(
      'https://islam.house/prayer_times',
    )
    expect(apexRedirectUrl('https://www.islam.house/')).toBe('https://islam.house/')
  })

  it('does not redirect apex or other hosts', () => {
    expect(apexRedirectUrl('https://islam.house/quran?x=1')).toBeNull()
    expect(apexRedirectUrl('https://islam.house/')).toBeNull()
    expect(apexRedirectUrl('http://localhost:5173/quran')).toBeNull()
  })
})

describe('http to https redirect', () => {
  it('redirects http apex to https apex preserving path and query', () => {
    expect(httpsRedirectUrl('http://islam.house/quran?x=1')).toBe(
      'https://islam.house/quran?x=1',
    )
    expect(httpsRedirectUrl('http://islam.house/')).toBe('https://islam.house/')
  })

  it('redirects http www to https apex in one hop', () => {
    expect(httpsRedirectUrl('http://www.islam.house/prayer_times')).toBe(
      'https://islam.house/prayer_times',
    )
  })

  it('does not redirect https or unrelated hosts', () => {
    expect(httpsRedirectUrl('https://islam.house/')).toBeNull()
    expect(httpsRedirectUrl('https://www.islam.house/')).toBeNull()
    expect(httpsRedirectUrl('http://localhost:5173/quran')).toBeNull()
  })
})
