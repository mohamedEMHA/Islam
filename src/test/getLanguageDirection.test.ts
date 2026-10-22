import { describe, expect, it } from 'vitest'
import { getLanguageDirection } from '@/i18n/config'

describe('getLanguageDirection', () => {
  it('returns rtl for Arabic and Urdu', () => {
    expect(getLanguageDirection('ar')).toBe('rtl')
    expect(getLanguageDirection('ur')).toBe('rtl')
  })

  it('returns ltr for other supported languages', () => {
    expect(getLanguageDirection('en')).toBe('ltr')
    expect(getLanguageDirection('fr')).toBe('ltr')
    expect(getLanguageDirection('id')).toBe('ltr')
  })

  it('defaults unknown languages to ltr', () => {
    expect(getLanguageDirection('de')).toBe('ltr')
  })
})
