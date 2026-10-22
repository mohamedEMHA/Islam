import { describe, expect, it } from 'vitest'
import { apexRedirectUrl } from '../../worker/redirect'

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
