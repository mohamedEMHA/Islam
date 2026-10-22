import { describe, expect, it } from 'vitest'
import {
  ADHKAR_TAB_TO_CATEGORY,
  daySeed,
  getQuranTranslationKey,
  getTafsirKey,
  pickDailyIndex,
} from '@/lib/utils/dailySpiritual'

describe('dailySpiritual utils', () => {
  it('computes stable day seed for the same calendar day', () => {
    const morning = new Date(2026, 7, 31, 8, 0, 0)
    const evening = new Date(2026, 7, 31, 20, 0, 0)
    expect(daySeed(morning)).toBe(daySeed(evening))
  })

  it('picks deterministic index within bounds', () => {
    const seed = daySeed(new Date(2026, 7, 31))
    expect(pickDailyIndex(seed, 7)).toBeGreaterThanOrEqual(0)
    expect(pickDailyIndex(seed, 7)).toBeLessThan(7)
  })

  it('maps UI languages to UmmahAPI translation keys', () => {
    expect(getQuranTranslationKey('en')).toBe('sahih_international')
    expect(getQuranTranslationKey('ur')).toBe('urdu')
    expect(getQuranTranslationKey('id')).toBe('indonesian')
    expect(getQuranTranslationKey('fr')).toBe('french')
    expect(getQuranTranslationKey('unknown')).toBe('sahih_international')
  })

  it('maps UI languages to tafsir editions', () => {
    expect(getTafsirKey('en')).toBe('ibn_kathir')
    expect(getTafsirKey('ar')).toBe('ibn_kathir_ar')
  })

  it('maps adhkar tabs to UmmahAPI categories', () => {
    expect(ADHKAR_TAB_TO_CATEGORY.morning_adhkar).toBe('morning')
    expect(ADHKAR_TAB_TO_CATEGORY.evening_adhkar).toBe('evening')
    expect(ADHKAR_TAB_TO_CATEGORY.after_prayer).toBe('after_prayer')
  })
})
