import { describe, expect, it } from 'vitest'
import {
  aggregateVerdict,
  analyzeProduct,
  hasHalalCertificationLabel,
  resolveAdditive,
} from '@/lib/halal/verdict'

describe('resolveAdditive', () => {
  it('returns haram for E120 carmine', () => {
    const result = resolveAdditive('E120')
    expect(result.status).toBe('haram')
    expect(result.name).toBeTruthy()
  })

  it('returns mushbooh for E471', () => {
    expect(resolveAdditive('E471').status).toBe('mushbooh')
  })

  it('returns halal for E300', () => {
    expect(resolveAdditive('E300').status).toBe('halal')
  })

  it('returns unknown for unlisted code', () => {
    expect(resolveAdditive('E9999').status).toBe('unknown')
  })
})

describe('aggregateVerdict', () => {
  it('returns haram when any additive is haram', () => {
    expect(
      aggregateVerdict([
        { code: 'E300', status: 'halal' },
        { code: 'E120', status: 'haram' },
      ]),
    ).toBe('haram')
  })

  it('returns mushbooh when worst is mushbooh and no haram', () => {
    expect(
      aggregateVerdict([
        { code: 'E300', status: 'halal' },
        { code: 'E471', status: 'mushbooh' },
      ]),
    ).toBe('mushbooh')
  })

  it('returns halal when all additives are halal', () => {
    expect(
      aggregateVerdict([
        { code: 'E300', status: 'halal' },
        { code: 'E330', status: 'halal' },
      ]),
    ).toBe('halal')
  })

  it('returns unknown when no additives and no halal label', () => {
    expect(aggregateVerdict([])).toBe('unknown')
  })

  it('returns halal when no additives but halal label present', () => {
    expect(aggregateVerdict([], true)).toBe('halal')
  })
})

describe('hasHalalCertificationLabel', () => {
  it('detects halal labels in OFF tags', () => {
    expect(hasHalalCertificationLabel(['en:halal', 'en:vegetarian'])).toBe(true)
    expect(hasHalalCertificationLabel(['en:organic'])).toBe(false)
  })
})

describe('analyzeProduct', () => {
  it('analyzes a product with haram additive as haram verdict', () => {
    const result = analyzeProduct({
      ingredientsText: 'Sugar, water, colour E120',
      additiveTags: ['en:e120'],
      labelsTags: [],
    })
    expect(result.verdict).toBe('haram')
    expect(result.additives.some((a) => a.code === 'E120')).toBe(true)
  })

  it('detects halal certification label', () => {
    const result = analyzeProduct({
      ingredientsText: 'Water, salt',
      labelsTags: ['en:halal-certified'],
    })
    expect(result.hasHalalLabel).toBe(true)
    expect(result.verdict).toBe('halal')
  })
})
