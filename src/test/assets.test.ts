import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('asset paths', () => {
  it('references brand assets in BrandLogo and PWA config', () => {
    const brandLogo = readFileSync(resolve('src/components/brand/BrandLogo.tsx'), 'utf8')
    expect(brandLogo).toContain("'/logo.png'")
    expect(brandLogo).toContain("'/brand/main-logo.png'")

    const viteConfig = readFileSync(resolve('vite.config.ts'), 'utf8')
    expect(viteConfig).toContain("'logo.png'")
  })

  it('ships main navbar logo in public/brand', () => {
    expect(existsSync(resolve('public/brand/main-logo.png'))).toBe(true)
  })

  it('ships multi platform favicon set', () => {
    for (const file of [
      'public/favicon.ico',
      'public/favicon.svg',
      'public/favicon_16.png',
      'public/favicon_32.png',
      'public/favicon_48.png',
      'public/apple_touch_icon.png',
      'public/icons/icon_192.png',
      'public/icons/icon_512.png',
      'public/icons/icon_512_maskable.png',
    ]) {
      expect(existsSync(resolve(file))).toBe(true)
    }

    const html = readFileSync(resolve('index.html'), 'utf8')
    expect(html).toContain('favicon.svg')
    expect(html).toContain('favicon_48.png')
    expect(html).toContain('apple_touch_icon.png')
    expect(html).toContain('/icons/icon_192.png')

    const viteConfig = readFileSync(resolve('vite.config.ts'), 'utf8')
    expect(viteConfig).toContain("'/icons/icon_192.png'")
    expect(viteConfig).toContain("'/icons/icon_512_maskable.png'")
    expect(viteConfig).toContain("purpose: 'maskable'")
  })

  it('ships bundled adhan audio in public/adhan', () => {
    for (const id of ['mishary', 'makkah', 'madinah']) {
      expect(existsSync(resolve(`public/adhan/${id}.mp3`))).toBe(true)
    }
  })
})
