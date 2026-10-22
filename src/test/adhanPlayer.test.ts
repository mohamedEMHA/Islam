import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ADHAN_MUEZZINS, getAdhanUrls } from '@/lib/hooks/useAdhanPlayer'

describe('adhan player sources', () => {
  it('defines three muezzins with local primary URLs', () => {
    expect(ADHAN_MUEZZINS).toHaveLength(3)
    for (const muezzin of ADHAN_MUEZZINS) {
      expect(muezzin.urls[0]).toMatch(/^\/adhan\/\w+\.mp3$/)
      expect(muezzin.urls.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('ships bundled adhan mp3 assets', () => {
    for (const id of ['mishary', 'makkah', 'madinah']) {
      expect(existsSync(resolve(`public/adhan/${id}.mp3`))).toBe(true)
    }
  })

  it('falls back to github raw for unknown muezzin ids', () => {
    const urls = getAdhanUrls('unknown')
    expect(urls).toEqual(getAdhanUrls('mishary'))
  })
})
