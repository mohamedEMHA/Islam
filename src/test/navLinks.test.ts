import { describe, expect, it } from 'vitest'
import { FOOTER_GROUP_DEFS, NAV_GROUP_DEFS, APP_UTILITY_LINK_DEFS } from '@/lib/navConfig'
import { router } from '@/app/router'
import type { RouteObject } from 'react-router-dom'

function joinPath(prefix: string, segment: string): string {
  if (segment.startsWith('/')) return segment
  if (!prefix || prefix === '/') return `/${segment}`.replace(/\/+/g, '/')
  return `${prefix.replace(/\/$/, '')}/${segment}`.replace(/\/+/g, '/')
}

function collectRouterPaths(routes: RouteObject[], prefix = ''): string[] {
  const out: string[] = []
  for (const route of routes) {
    const path = route.path
    let nextPrefix = prefix

    if (route.index) {
      out.push(prefix || '/')
    }

    if (typeof path === 'string' && path !== '*') {
      const full = joinPath(prefix, path)
      if (!full.includes(':')) out.push(full === '' ? '/' : full)
      nextPrefix = full
    }

    if (route.children) {
      out.push(...collectRouterPaths(route.children, nextPrefix))
    }
  }
  return out
}

describe('nav and footer links resolve', () => {
  const staticRoutes = new Set(collectRouterPaths(router.routes))

  const linkPaths = [
    ...NAV_GROUP_DEFS.flatMap((g) => g.items.map((i) => i.path)),
    ...APP_UTILITY_LINK_DEFS.map((i) => i.path),
    ...FOOTER_GROUP_DEFS.flatMap((g) => g.items.map((i) => i.path)),
  ].filter((p) => p.startsWith('/') && !p.includes('#'))

  it.each(linkPaths)('route exists for %s', (path) => {
    expect(staticRoutes.has(path)).toBe(true)
  })
})
