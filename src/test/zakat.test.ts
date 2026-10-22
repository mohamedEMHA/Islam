import { describe, expect, it } from 'vitest'
import type { ZakatCalculateData } from '@/lib/api/ummah'
import {
  mapUmmahMetalPrices,
  priceWithinTolerance,
  verifyMetalPrices,
  METAL_PRICE_TOLERANCE_PERCENT,
} from '@/lib/utils/zakatPrices'
import {
  calculateZakat,
  calculateNisabFromGold,
  calculateZakatAlFitr,
  ZAKAT_AL_FITR_AMOUNTS,
} from '@/lib/utils/zakat'

function sampleUmmahResult(overrides: Partial<ZakatCalculateData> = {}): ZakatCalculateData {
  return {
    zakat_due: 250,
    zakat_due_formatted: '250.00',
    above_nisab: true,
    nisab_standard: 'gold',
    nisab_value: 12000,
    nisab_gold_grams: 85,
    nisab_silver_grams: 595,
    rate: '2.5%',
    breakdown: {
      cash: 10000,
      gold_value: 0,
      silver_value: 0,
      stocks: 0,
      business_goods: 0,
      other_investments: 0,
      gross_wealth: 10000,
      liabilities: 0,
      net_zakatable_wealth: 10000,
    },
    note: 'Test note',
    prices_used: {
      auto_filled: true,
      currency: 'USD',
      gold_price_per_gram: 142.15,
      silver_price_per_gram: 2.14,
      source: 'gold-api.com (spot)',
      as_of: '2026-08-31T14:00:00.000Z',
      is_fallback: false,
    },
    ...overrides,
  }
}

describe('priceWithinTolerance', () => {
  it('returns true when prices are within tolerance', () => {
    expect(priceWithinTolerance(142.15, 142.5, 1.5)).toBe(true)
    expect(priceWithinTolerance(2.14, 2.15, 1.5)).toBe(true)
  })

  it('returns false when prices diverge beyond tolerance', () => {
    expect(priceWithinTolerance(142.15, 150, 1.5)).toBe(false)
    expect(priceWithinTolerance(0, 2.14, 1.5)).toBe(false)
  })
})

describe('verifyMetalPrices', () => {
  it('marks prices verified when both metals agree', () => {
    const result = verifyMetalPrices(
      { goldPerGram: 142.15, silverPerGram: 2.14 },
      { goldPerGram: 142.2, silverPerGram: 2.13 },
    )

    expect(result.goldVerified).toBe(true)
    expect(result.silverVerified).toBe(true)
    expect(result.verified).toBe(true)
    expect(result.tolerancePercent).toBe(METAL_PRICE_TOLERANCE_PERCENT)
  })

  it('marks unverified when silver diverges', () => {
    const result = verifyMetalPrices(
      { goldPerGram: 142.15, silverPerGram: 2.14 },
      { goldPerGram: 142.2, silverPerGram: 2.5 },
    )

    expect(result.goldVerified).toBe(true)
    expect(result.silverVerified).toBe(false)
    expect(result.verified).toBe(false)
  })
})

describe('mapUmmahMetalPrices', () => {
  it('maps UmmahAPI prices_used fields', () => {
    const mapped = mapUmmahMetalPrices(sampleUmmahResult())
    expect(mapped.goldPerGram).toBe(142.15)
    expect(mapped.silverPerGram).toBe(2.14)
  })
})

describe('calculateZakat', () => {
  it('returns 2.5% when above nisab', () => {
    const nisab = calculateNisabFromGold(100)
    expect(calculateZakat(10000, nisab)).toBe(250)
  })

  it('returns zero when below nisab', () => {
    expect(calculateZakat(5000, 8500)).toBe(0)
  })
})

describe('zakat al-fitr', () => {
  it('clamps members to at least 1', () => {
    expect(calculateZakatAlFitr(0, 15)).toBe(15)
    expect(calculateZakatAlFitr(-2, 15)).toBe(15)
  })

  it('covers all common currencies with positive amounts', () => {
    for (const [currency, amount] of Object.entries(ZAKAT_AL_FITR_AMOUNTS)) {
      expect(amount, currency).toBeGreaterThan(0)
      expect(calculateZakatAlFitr(4, amount)).toBe(amount * 4)
    }
    expect(ZAKAT_AL_FITR_AMOUNTS.PKR).toBeDefined()
    expect(ZAKAT_AL_FITR_AMOUNTS.IDR).toBeDefined()
  })
})
