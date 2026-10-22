import { describe, expect, it } from 'vitest'
import { filterBabyNames, type IslamicName } from '@/lib/api/ummah'

const sampleNames: IslamicName[] = [
  {
    id: 1,
    name: 'Muhammad',
    arabic: 'مُحَمَّد',
    gender: 'male',
    meaning: 'Praised, commendable',
    origin: 'Arabic',
    root: 'ح م د',
    note: 'Prophet name',
  },
  {
    id: 101,
    name: 'Fatima',
    arabic: 'فَاطِمَة',
    gender: 'female',
    meaning: 'One who weans',
    origin: 'Arabic',
    root: 'ف ط م',
    note: 'Daughter of the Prophet',
  },
]

describe('filterBabyNames', () => {
  it('filters by first letter', () => {
    expect(filterBabyNames(sampleNames, '', 'M')).toHaveLength(1)
    expect(filterBabyNames(sampleNames, '', 'M')[0]?.name).toBe('Muhammad')
  })

  it('filters by search query across fields', () => {
    expect(filterBabyNames(sampleNames, 'weans', null)).toHaveLength(1)
    expect(filterBabyNames(sampleNames, 'Prophet', null)).toHaveLength(2)
  })

  it('returns all names when filters are empty', () => {
    expect(filterBabyNames(sampleNames, '', null)).toHaveLength(2)
  })
})
