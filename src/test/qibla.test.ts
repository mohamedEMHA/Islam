import { describe, expect, it } from 'vitest'
import {
  calculateDistanceToKaaba,
  calculateQiblaBearing,
  getCompassHeading,
} from '@/lib/utils/qibla'

describe('qibla utils', () => {
  it('computes Athens bearing close to AlAdhan (~135°)', () => {
    const bearing = calculateQiblaBearing(37.9838, 23.7275)
    expect(bearing).toBeGreaterThan(134)
    expect(bearing).toBeLessThan(137)
  })

  it('computes distance to Makkah for Athens', () => {
    const km = calculateDistanceToKaaba(37.9838, 23.7275)
    expect(km).toBeGreaterThan(2000)
    expect(km).toBeLessThan(2800)
  })

  it('prefers webkitCompassHeading when present', () => {
    expect(getCompassHeading({ alpha: 90, webkitCompassHeading: 45 })).toBe(45)
  })

  it('converts absolute alpha (CCW) to compass heading', () => {
    expect(getCompassHeading({ absolute: true, alpha: 90 })).toBe(270)
    expect(getCompassHeading({ absolute: true, alpha: 0 })).toBe(0)
  })

  it('ignores relative non-absolute alpha', () => {
    expect(getCompassHeading({ absolute: false, alpha: 90 })).toBeNull()
  })
})
