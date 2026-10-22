import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchDailySpiritualTab } from '@/lib/api/dailySpiritual'
import { getMsUntilLocalMidnight } from '@/lib/query/client'
import { daySeed, type DailySpiritualTab } from '@/lib/utils/dailySpiritual'

export function dailySpiritualQueryKey(tab: DailySpiritualTab, language: string, seed: number) {
  return ['dailySpiritual', 'v2', tab, language, seed] as const
}

export function useDailySpiritualTab(tab: DailySpiritualTab, enabled = true) {
  const { i18n } = useTranslation()
  const seed = daySeed()
  const language = i18n.language

  return useQuery({
    queryKey: dailySpiritualQueryKey(tab, language, seed),
    queryFn: ({ signal }) => fetchDailySpiritualTab(tab, language, signal, seed),
    enabled,
    staleTime: getMsUntilLocalMidnight(),
    gcTime: getMsUntilLocalMidnight(),
  })
}

export function useDailySpiritualFeed(initialTab: DailySpiritualTab = 'verse') {
  const query = useDailySpiritualTab(initialTab)

  return {
    feed: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
