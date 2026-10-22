import { describe, expect, it } from 'vitest'

import ar from '@/i18n/locales/ar.json'
import en from '@/i18n/locales/en.json'
import fr from '@/i18n/locales/fr.json'
import id from '@/i18n/locales/id.json'
import ur from '@/i18n/locales/ur.json'
import allowIdentical from './i18nAllowIdentical.json'

const ALLOW_IDENTICAL_TO_EN = new Set(allowIdentical as string[])

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') {
    return prefix ? [prefix] : []
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenKeys(item, `${prefix}[${index}]`))
  }

  const record = value as Record<string, unknown>
  return Object.keys(record).flatMap((key) => {
    const path = prefix ? `${prefix}.${key}` : key
    return flattenKeys(record[key], path)
  })
}

function flattenValues(value: unknown, prefix = ''): Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return prefix ? { [prefix]: value } : {}
  }
  if (Array.isArray(value)) {
    return value.reduce<Record<string, unknown>>((acc, item, index) => {
      Object.assign(acc, flattenValues(item, `${prefix}[${index}]`))
      return acc
    }, {})
  }
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
    (acc, [key, nested]) => {
      const path = prefix ? `${prefix}.${key}` : key
      Object.assign(acc, flattenValues(nested, path))
      return acc
    },
    {},
  )
}

describe('i18n locale parity', () => {
  const enKeys = new Set(flattenKeys(en))
  const enValues = flattenValues(en)

  it.each([
    ['ar', ar],
    ['ur', ur],
    ['id', id],
    ['fr', fr],
  ] as const)('locale %s has the same keys as en', (_code, locale) => {
    const localeKeys = new Set(flattenKeys(locale))
    expect([...enKeys].sort()).toEqual([...localeKeys].sort())
  })

  it.each([
    ['ar', ar],
    ['ur', ur],
    ['id', id],
    ['fr', fr],
  ] as const)('locale %s does not leave new UI copy in English', (_code, locale) => {
    const localeValues = flattenValues(locale)
    const identical = Object.keys(enValues).filter((key) => {
      if (ALLOW_IDENTICAL_TO_EN.has(key)) return false
      const enVal = enValues[key]
      const locVal = localeValues[key]
      return (
        typeof enVal === 'string' &&
        typeof locVal === 'string' &&
        enVal.trim().length > 1 &&
        /[A-Za-z]{3,}/.test(enVal) &&
        locVal === enVal
      )
    })

    expect(identical).toEqual([])
  })

  it.each([
    ['ar', ar],
    ['ur', ur],
    ['id', id],
    ['fr', fr],
  ] as const)('locale %s translates common.on and weekdays', (_code, locale) => {
    const localeValues = flattenValues(locale)
    expect(localeValues['common.on']).not.toBe(enValues['common.on'])
    expect(localeValues['common.weekdays.short.sun']).not.toBe(enValues['common.weekdays.short.sun'])
    expect(localeValues['common.weekdays.short.mon']).not.toBe(enValues['common.weekdays.short.mon'])
  })

  it('en has content-disclaimer and format helper keys', () => {
    expect(enValues['common.contentEnglishOnly']).toBeTruthy()
    expect(enValues['pages.tafsir.fallbackEnglish']).toBeTruthy()
    expect(enValues['pages.duas.categories.morning']).toBeTruthy()
    expect(enValues['quranReader.scripts.uthmani']).toBeTruthy()
    expect(enValues['hadithReader.translationEnglishOnly']).toBeTruthy()
  })
})
