import { useQuery } from '@tanstack/react-query'
import { getIslamicNames } from '@/lib/api/ummah'
import type { IslamicName } from '@/lib/api/ummah'

export type BabyNamesGenderFilter = 'all' | 'male' | 'female'

const CACHE_KEY_PREFIX = 'islam_baby_names_v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export function babyNamesQueryKey(gender: BabyNamesGenderFilter) {
  return ['babyNames', gender] as const
}

function cacheKey(gender: BabyNamesGenderFilter): string {
  return `${CACHE_KEY_PREFIX}:${gender}`
}

function readCachedNames(gender: BabyNamesGenderFilter): IslamicName[] | undefined {
  try {
    const raw = localStorage.getItem(cacheKey(gender))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as { savedAt: number; names: IslamicName[] }
    if (!parsed?.names || !Array.isArray(parsed.names)) return undefined
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return undefined
    return parsed.names
  } catch {
    return undefined
  }
}

function writeCachedNames(gender: BabyNamesGenderFilter, names: IslamicName[]): void {
  try {
    localStorage.setItem(cacheKey(gender), JSON.stringify({ savedAt: Date.now(), names }))
  } catch {
    // quota / private mode
  }
}

export function useBabyNames(gender: BabyNamesGenderFilter) {
  return useQuery({
    queryKey: babyNamesQueryKey(gender),
    queryFn: async ({ signal }) => {
      const names = await getIslamicNames({
        gender: gender === 'all' ? undefined : gender,
        signal,
      })
      writeCachedNames(gender, names)
      return names
    },
    initialData: () => readCachedNames(gender),
    initialDataUpdatedAt: () => {
      try {
        const raw = localStorage.getItem(cacheKey(gender))
        if (!raw) return 0
        return (JSON.parse(raw) as { savedAt: number }).savedAt ?? 0
      } catch {
        return 0
      }
    },
    staleTime: Infinity,
    gcTime: CACHE_TTL_MS,
  })
}
