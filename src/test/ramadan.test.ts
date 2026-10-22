import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveRamadanHijriYear } from '@/lib/utils/hijriCalendar'
import { computeCountdownFromTarget, resolveRamadanTarget } from '@/lib/utils/ramadan'

vi.mock('@/lib/api/aladhan', () => ({
  hijriToGregorian: vi.fn(async (_day: number, _month: number, year: number) => {
    // Approximate: Ramadan 1 of 1448 → 2026-02-18 (stable fixture for tests)
    if (year === 1448) return '18-02-2026'
    if (year === 1449) return '08-02-2027'
    return '01-03-2026'
  }),
}))

describe('resolveRamadanHijriYear', () => {
  it('uses current hijri year before and during Ramadan', () => {
    expect(resolveRamadanHijriYear(3, 1448)).toBe(1448)
    expect(resolveRamadanHijriYear(8, 1448)).toBe(1448)
    expect(resolveRamadanHijriYear(9, 1448)).toBe(1448)
  })

  it('uses next hijri year after Ramadan', () => {
    expect(resolveRamadanHijriYear(10, 1448)).toBe(1449)
    expect(resolveRamadanHijriYear(12, 1447)).toBe(1448)
  })
})

describe('resolveRamadanTarget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks current month as in Ramadan', async () => {
    const target = await resolveRamadanTarget(9, 1448)
    expect(target.inRamadan).toBe(true)
    expect(target.ramadanHijriYear).toBe(1448)
  })

  it('targets Ramadan 1448 when currently in Rabīʿ al-awwal 1448', async () => {
    const target = await resolveRamadanTarget(3, 1448)
    expect(target.inRamadan).toBe(false)
    expect(target.ramadanHijriYear).toBe(1448)
    expect(target.targetDate.getFullYear()).toBeGreaterThanOrEqual(2026)
  })
})

describe('computeCountdownFromTarget', () => {
  it('returns zero countdown while in Ramadan', () => {
    const parts = computeCountdownFromTarget({
      targetDate: new Date(),
      inRamadan: true,
      ramadanHijriYear: 1448,
    })

    expect(parts.inRamadan).toBe(true)
    expect(parts.days).toBe(0)
    expect(parts.hours).toBe(0)
  })
})
