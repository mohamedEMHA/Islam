import { useEffect, useState } from 'react'
import { scrollWindowToTop } from '@/lib/utils/scroll'

export const LIST_PAGE_SIZE = 20

export function usePagination<T>(items: T[], pageSize: number, resetKey: unknown) {
  const [page, setPageState] = useState(1)

  useEffect(() => {
    setPageState(1)
  }, [resetKey])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    if (page > totalPages) {
      setPageState(totalPages)
    }
  }, [page, totalPages])

  const setPage = (next: number) => {
    const clamped = Math.max(1, Math.min(next, totalPages))
    setPageState(clamped)
    scrollWindowToTop()
  }

  const start = (safePage - 1) * pageSize

  return {
    page: safePage,
    totalPages,
    totalItems: items.length,
    paginatedItems: items.slice(start, start + pageSize),
    setPage,
    showPagination: items.length > pageSize,
  }
}
