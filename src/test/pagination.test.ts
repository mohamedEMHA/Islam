import { describe, expect, it } from 'vitest'

import { LIST_PAGE_SIZE } from '@/lib/hooks/usePagination'

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  return {
    page: safePage,
    totalPages,
    paginatedItems: items.slice(start, start + pageSize),
    showPagination: items.length > pageSize,
  }
}

describe('pagination slice', () => {
  const items = Array.from({ length: 114 }, (_, index) => index + 1)

  it('uses 20 items per page by default size', () => {
    const first = paginate(items, 1, LIST_PAGE_SIZE)
    expect(first.paginatedItems).toHaveLength(20)
    expect(first.totalPages).toBe(6)
    expect(first.showPagination).toBe(true)
  })

  it('returns the final partial page', () => {
    const last = paginate(items, 6, LIST_PAGE_SIZE)
    expect(last.paginatedItems).toHaveLength(14)
    expect(last.page).toBe(6)
  })

  it('hides pagination for short lists', () => {
    const short = paginate(items.slice(0, 12), 1, LIST_PAGE_SIZE)
    expect(short.showPagination).toBe(false)
    expect(short.totalPages).toBe(1)
  })
})
