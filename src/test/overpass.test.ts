import { describe, expect, it } from 'vitest'

import {
  buildMosqueQuery,
  parseOverpassElements,
} from '@/lib/api/overpass'

describe('buildMosqueQuery', () => {
  it('includes amenity and religion filters with around clause', () => {
    const query = buildMosqueQuery(37.9838, 23.7275, 5000)

    expect(query).toContain('[out:json][timeout:25]')
    expect(query).toContain('node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,37.9838,23.7275)')
    expect(query).toContain('way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,37.9838,23.7275)')
    expect(query).toContain('relation["amenity"="place_of_worship"]["religion"="muslim"](around:5000,37.9838,23.7275)')
    expect(query).toContain('out center tags;')
  })

  it('rounds radius to at least 100 meters', () => {
    const query = buildMosqueQuery(0, 0, 50)
    expect(query).toContain('around:100,0,0')
  })
})

describe('parseOverpassElements', () => {
  const originLat = 37.9838
  const originLng = 23.7275

  it('parses nodes and ways with center coordinates', () => {
    const mosques = parseOverpassElements(
      [
        {
          type: 'node',
          id: 1,
          lat: 37.99,
          lon: 23.73,
          tags: { name: 'Central Mosque', 'addr:street': 'Main St' },
        },
        {
          type: 'way',
          id: 2,
          center: { lat: 37.985, lon: 23.72 },
          tags: { name: 'Community Masjid' },
        },
      ],
      originLat,
      originLng,
    )

    expect(mosques).toHaveLength(2)
    const central = mosques.find((mosque) => mosque.name === 'Central Mosque')
    expect(central?.address).toContain('Main St')
    expect(mosques.every((mosque) => mosque.distanceMeters > 0)).toBe(true)
  })

  it('sorts mosques by ascending distance from origin', () => {
    const mosques = parseOverpassElements(
      [
        {
          type: 'node',
          id: 10,
          lat: 38.1,
          lon: 23.8,
          tags: { name: 'Far Mosque' },
        },
        {
          type: 'node',
          id: 11,
          lat: 37.984,
          lon: 23.728,
          tags: { name: 'Near Mosque' },
        },
      ],
      originLat,
      originLng,
    )

    expect(mosques[0]?.name).toBe('Near Mosque')
    expect(mosques[1]?.name).toBe('Far Mosque')
    expect(mosques[0]!.distanceMeters).toBeLessThan(mosques[1]!.distanceMeters)
  })

  it('skips elements without coordinates', () => {
    const mosques = parseOverpassElements(
      [{ type: 'way', id: 99, tags: { name: 'Broken' } }],
      originLat,
      originLng,
    )

    expect(mosques).toHaveLength(0)
  })

  it('rejects invalid osm types and non-finite coordinates', () => {
    const mosques = parseOverpassElements(
      [
        {
          type: 'node" onload="alert(1)' as 'node',
          id: 1,
          lat: 37.99,
          lon: 23.73,
          tags: { name: 'Evil Type' },
        },
        {
          type: 'node',
          id: Number.NaN,
          lat: 37.99,
          lon: 23.73,
          tags: { name: 'Bad Id' },
        },
        {
          type: 'node',
          id: 3,
          lat: Number.POSITIVE_INFINITY,
          lon: 23.73,
          tags: { name: 'Bad Lat' },
        },
        {
          type: 'node',
          id: 4,
          lat: 37.99,
          lon: 23.73,
          tags: { name: 'Good' },
        },
      ],
      originLat,
      originLng,
    )

    expect(mosques).toHaveLength(1)
    expect(mosques[0]?.name).toBe('Good')
    expect(mosques[0]?.osmType).toBe('node')
  })
})
