import { describe, expect, it } from 'vitest'
import {
  formatAppInteger,
  formatAppNumber,
  formatCountdown,
  formatCountdownHms,
  formatGregorianLabel,
  formatTime12,
  resolveIntlLocale,
} from '@/lib/i18n/localeFormat'

describe('localeFormat', () => {
  it('resolves BCP 47 tags for app languages', () => {
    expect(resolveIntlLocale('ar')).toBe('ar-EG')
    expect(resolveIntlLocale('ur')).toBe('ur-PK')
    expect(resolveIntlLocale('id')).toBe('id-ID')
    expect(resolveIntlLocale('fr')).toBe('fr-FR')
    expect(resolveIntlLocale('en')).toBe('en-US')
  })

  it('formats Arabic-Indic digits for ar-EG', () => {
    const formatted = formatAppInteger(15, 'ar')
    expect(formatted).toMatch(/[٠-٩]+/)
    expect(formatAppInteger(1447, 'ar')).toMatch(/[٠-٩]+/)
  })

  it('keeps Latin digits for en', () => {
    expect(formatAppInteger(15, 'en')).toBe('15')
    expect(formatAppNumber(1234.5, 'en', { maximumFractionDigits: 1 })).toContain('1')
  })

  it('formats 12h time with locale digits for ar', () => {
    const out = formatTime12('07:05', 'ar')
    expect(out.length).toBeGreaterThan(3)
    expect(out).toMatch(/[٠-٩]/)
  })

  it('formats countdown with locale digits', () => {
    expect(formatCountdown(3661, 'en')).toBe('1h 1m')
    expect(formatCountdownHms(3661, 'en')).toBe('01:01:01')
    expect(formatCountdownHms(65, 'ar')).toMatch(/[٠-٩]:[٠-٩]/)
  })

  it('formats gregorian DD-MM-YYYY labels per locale', () => {
    const en = formatGregorianLabel('15-10-2026', 'en')
    const ar = formatGregorianLabel('15-10-2026', 'ar')
    expect(en).toMatch(/15/)
    expect(ar).toMatch(/[٠-٩]/)
  })
})
