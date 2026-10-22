import { describe, expect, it } from 'vitest'
import { calculateInheritanceShares } from '@/lib/utils/inheritance'

describe('inheritance calculator', () => {
  it('allocates wife 1/8 and children 2:1 of residue', () => {
    const result = calculateInheritanceShares({
      estateValue: 80_000,
      decedentSex: 'male',
      husbandAlive: false,
      wives: 1,
      sons: 1,
      daughters: 1,
      father: false,
      mother: false,
    })

    const wife = result.shares.find((s) => s.heir === 'wife')
    const son = result.shares.find((s) => s.heir === 'son')
    const daughter = result.shares.find((s) => s.heir === 'daughter')
    expect(wife?.amount).toBeCloseTo(10_000)
    expect(son?.amount).toBeCloseTo(46_666.67, 1)
    expect(daughter?.amount).toBeCloseTo(23_333.33, 1)
  })

  it('applies umariyyatayn for husband and parents', () => {
    const result = calculateInheritanceShares({
      estateValue: 120_000,
      decedentSex: 'female',
      husbandAlive: true,
      wives: 0,
      sons: 0,
      daughters: 0,
      father: true,
      mother: true,
    })

    expect(result.shares.find((s) => s.heir === 'husband')?.amount).toBeCloseTo(60_000)
    expect(result.shares.find((s) => s.heir === 'mother')?.amount).toBeCloseTo(20_000)
    expect(result.shares.find((s) => s.heir === 'father')?.amount).toBeCloseTo(40_000)
  })

  it('gives two daughters fixed 2/3 and radd of leftover', () => {
    const result = calculateInheritanceShares({
      estateValue: 90_000,
      decedentSex: 'male',
      husbandAlive: false,
      wives: 0,
      sons: 0,
      daughters: 2,
      father: false,
      mother: false,
    })

    expect(result.appliedRadd).toBe(true)
    const daughters = result.shares.filter((s) => s.heir === 'daughter')
    expect(daughters).toHaveLength(2)
    expect(daughters[0]?.amount).toBeCloseTo(45_000)
    expect(daughters[1]?.amount).toBeCloseTo(45_000)
  })

  it('splits wives share equally and ignores husband when decedent is male', () => {
    const result = calculateInheritanceShares({
      estateValue: 100_000,
      decedentSex: 'male',
      husbandAlive: true,
      wives: 2,
      sons: 0,
      daughters: 0,
      father: false,
      mother: false,
    })

    expect(result.shares.every((s) => s.heir !== 'husband')).toBe(true)
    const wives = result.shares.filter((s) => s.heir === 'wife')
    expect(wives).toHaveLength(2)
    expect(wives[0]?.amount).toBeCloseTo(12_500)
    expect(wives[1]?.amount).toBeCloseTo(12_500)
  })

  it('applies awl when fixed shares exceed the estate', () => {
    const result = calculateInheritanceShares({
      estateValue: 100_000,
      decedentSex: 'female',
      husbandAlive: true,
      wives: 0,
      sons: 0,
      daughters: 1,
      father: true,
      mother: true,
    })

    expect(result.appliedAwl).toBe(true)
    expect(result.appliedRadd).toBe(false)
    const total = result.shares.reduce((sum, s) => sum + s.amount, 0)
    expect(total).toBeCloseTo(100_000, 0)
  })

  it('marks unassigned residue when only a spouse remains', () => {
    const result = calculateInheritanceShares({
      estateValue: 50_000,
      decedentSex: 'male',
      husbandAlive: false,
      wives: 1,
      sons: 0,
      daughters: 0,
      father: false,
      mother: false,
    })

    expect(result.appliedRadd).toBe(false)
    const residue = result.shares.find((s) => s.heir === 'residue')
    expect(residue).toBeDefined()
    expect(residue?.amount).toBeCloseTo(37_500)
    expect(result.shares.find((s) => s.heir === 'wife')?.amount).toBeCloseTo(12_500)
  })

  it('rounds monetary amounts to cents', () => {
    const result = calculateInheritanceShares({
      estateValue: 80_000,
      decedentSex: 'male',
      husbandAlive: false,
      wives: 1,
      sons: 1,
      daughters: 1,
      father: false,
      mother: false,
    })

    for (const share of result.shares) {
      expect(Number.isInteger(Math.round(share.amount * 100))).toBe(true)
    }
  })
})
