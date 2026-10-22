import { useQuery } from '@tanstack/react-query'
import { getDuasByCategory } from '@/lib/api/duas'
import { STALE_TIME_CONTENT } from '@/lib/query/client'

export function duasCategoryQueryKey(categoryId: string) {
  return ['duas', categoryId] as const
}

export function useDuasCategory(categoryId: string | null) {
  return useQuery({
    queryKey: duasCategoryQueryKey(categoryId ?? ''),
    queryFn: () => getDuasByCategory(categoryId!),
    enabled: !!categoryId,
    staleTime: STALE_TIME_CONTENT,
  })
}
