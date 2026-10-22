import { describe, expect, it } from 'vitest'

import {
  formatDistanceMeters,
  haversineDistanceMeters,
  sortByDistance,
} from '@/lib/utils/haversine'

describe('haversineDistanceMeters', () => {
  it('returns zero for identical coordinates', () => {
    expect(haversineDistanceMeters(37.9838, 23.7275, 37.9838, 23.7275)).toBe(0)
  })

  it('calculates a plausible distance between Athens and Istanbul', () => {
    const meters = haversineDistanceMeters(37.9838, 23.7275, 41.0082, 28.9784)
    expect(meters).toBeGreaterThan(500_000)
    expect(meters).toBeLessThan(600_000)
  })
})

describe('sortByDistance', () => {
  it('sorts points by distance from origin', () => {
    const sorted = sortByDistance(
      [
        { id: 'far', latitude: 38.5, longitude: 24.5 },
        { id: 'near', latitude: 37.99, longitude: 23.73 },
      ],
      37.9838,
      23.7275,
    )

    expect(sorted[0]?.id).toBe('near')
    expect(sorted[1]?.id).toBe('far')
  })
})

describe('formatDistanceMeters', () => {
  it('formats sub kilometer distances in meters', () => {
    expect(formatDistanceMeters(450)).toBe('450 m')
  })

  it('formats kilometer distances with one decimal under 10 km', () => {
    expect(formatDistanceMeters(2500)).toBe('2.5 km')
  })
})
