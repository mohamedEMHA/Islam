import { QueryClient } from '@tanstack/react-query'

export const STALE_TIME_QURAN = 1000 * 60 * 60 * 24
export const STALE_TIME_CONTENT = 1000 * 60 * 60

export function getMsUntilLocalMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.max(midnight.getTime() - now.getTime(), 60_000)
}

export const STALE_TIME_DAILY = getMsUntilLocalMidnight()

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})
