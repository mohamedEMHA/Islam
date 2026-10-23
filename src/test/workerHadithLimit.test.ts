import { describe, expect, it, vi } from 'vitest'
import { consumeApiRateLimit } from '../../worker/allowlist'

describe('consumeApiRateLimit (Sunnah SEO enrich gate)', () => {
  it('returns false when rate limited', async () => {
    const limit = vi.fn().mockResolvedValue({ success: false })
    const request = new Request('https://islam.house/hadith/bukhari/1', {
      headers: { Accept: 'text/markdown', 'CF-Connecting-IP': '1.2.3.4' },
    })

    await expect(consumeApiRateLimit(request, { limit })).resolves.toBe(false)
    expect(limit).toHaveBeenCalledWith({ key: '1.2.3.4' })
  })

  it('returns true when allowed (markdown and HTML share this gate)', async () => {
    const limit = vi.fn().mockResolvedValue({ success: true })
    const request = new Request('https://islam.house/hadith/bukhari/1', {
      headers: { Accept: 'text/markdown', 'CF-Connecting-IP': '5.6.7.8' },
    })

    await expect(consumeApiRateLimit(request, { limit })).resolves.toBe(true)
    expect(limit).toHaveBeenCalledWith({ key: '5.6.7.8' })
  })
})
