import { describe, expect, it } from 'vitest'
import {
  collectENumbers,
  extractENumbers,
  extractENumbersFromTags,
  normalizeENumber,
} from '@/lib/halal/parseIngredients'

describe('normalizeENumber', () => {
  it('normalizes E120 variants', () => {
    expect(normalizeENumber('E120')).toBe('E120')
    expect(normalizeENumber('e120')).toBe('E120')
    expect(normalizeENumber('120')).toBe('E120')
  })

  it('normalizes four digit codes', () => {
    expect(normalizeENumber('E150a')).toBeNull()
    expect(normalizeENumber('1500')).toBe('E1500')
  })

  it('rejects invalid input', () => {
    expect(normalizeENumber('')).toBeNull()
    expect(normalizeENumber('abc')).toBeNull()
    expect(normalizeENumber('12')).toBeNull()
  })
})

describe('extractENumbers', () => {
  it('extracts multiple codes from ingredients text', () => {
    const text =
      'Water, sugar, colour (E120), emulsifier E471, acidity regulator (e330), preservative 211'
    expect(extractENumbers(text)).toEqual(['E120', 'E211', 'E330', 'E471'])
  })

  it('returns empty array for text without codes', () => {
    expect(extractENumbers('Water, salt, flour')).toEqual([])
  })
})

describe('extractENumbersFromTags', () => {
  it('parses Open Food Facts additive tags', () => {
    expect(extractENumbersFromTags(['en:e120', 'en:e471', 'en:monosodium-glutamate'])).toEqual([
      'E120',
      'E471',
    ])
  })
})

describe('collectENumbers', () => {
  it('merges ingredients and tags without duplicates', () => {
    expect(
      collectENumbers({
        ingredientsText: 'Contains E300 and E471',
        additiveTags: ['en:e471', 'en:e120'],
      }),
    ).toEqual(['E120', 'E300', 'E471'])
  })
})
