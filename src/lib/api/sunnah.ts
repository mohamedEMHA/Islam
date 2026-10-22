import { apiFetch } from './client'
import type { HadithBook, HadithChapter, HadithEntry } from '@/types/hadith'
import {
  dedupeBooks,
  parseApiHadith,
  parseHadithBook,
  parseHadithChapter,
} from '@/lib/utils/sunnahParsers'

const ISLAMIC_APP_BASE = 'https://api.islamic.app/v1/hadith'
const PROXY_BASE = '/api/sunnah'

export interface SunnahCollectionRoute {
  sunnahSlug: string
  fortyBookNumber?: string
}

const SUNNAH_COLLECTION_ROUTES: Record<string, SunnahCollectionRoute> = {
  bukhari: { sunnahSlug: 'bukhari' },
  muslim: { sunnahSlug: 'muslim' },
  abudawud: { sunnahSlug: 'abudawud' },
  tirmidhi: { sunnahSlug: 'tirmidhi' },
  nasai: { sunnahSlug: 'nasai' },
  ibnmajah: { sunnahSlug: 'ibnmajah' },
  malik: { sunnahSlug: 'malik' },
  nawawi: { sunnahSlug: 'nawawi40', fortyBookNumber: '1' },
  qudsi: { sunnahSlug: 'qudsi40', fortyBookNumber: '2' },
  dehlawi: { sunnahSlug: 'forty', fortyBookNumber: '3' },
}

export function getSunnahRoute(collectionId: string): SunnahCollectionRoute | undefined {
  return SUNNAH_COLLECTION_ROUTES[collectionId]
}

export function hasSunnahHierarchy(collectionId: string): boolean {
  return !!getSunnahRoute(collectionId)
}

function hasSunnahProxy(): boolean {
  // Same-origin /api/sunnah is always available in prod (Worker) and Vite proxy in dev.
  return true
}

type HadithProvider = 'sunnah.com' | 'islamic.app'

interface ApiEnvelope<T> {
  data: T
}

interface BooksResponse {
  data?: unknown[]
  books?: unknown[]
}

interface ChaptersResponse {
  data?: unknown[]
  chapters?: unknown[]
}

interface HadithListResponse {
  data?: {
    hadiths?: unknown[]
    total?: number
    limit?: number
    offset?: number
  }
  hadiths?: unknown[]
  total?: number
}

function resolveCollectionSlug(route: SunnahCollectionRoute): string {
  return route.fortyBookNumber ? 'forty' : route.sunnahSlug
}

function resolveBookNumber(route: SunnahCollectionRoute, bookNumber?: string): string | undefined {
  return route.fortyBookNumber ?? bookNumber
}

/** List endpoint: /collections/{slug}/books (never /books/{n}/books). */
export function buildBooksListPaths(route: SunnahCollectionRoute): {
  sunnahPath: string
  islamicPath: string
} {
  const slug = resolveCollectionSlug(route)
  return {
    sunnahPath: `/collections/${slug}/books`,
    islamicPath: `/collections/${slug}/books`,
  }
}

/** Book-scoped resource: /collections/{slug}/books/{book}{suffix} */
export function buildBookResourcePaths(
  route: SunnahCollectionRoute,
  bookNumber: string,
  suffix = '',
): { sunnahPath: string; islamicPath: string } {
  const slug = resolveCollectionSlug(route)
  const book = resolveBookNumber(route, bookNumber) ?? bookNumber
  return {
    sunnahPath: `/collections/${slug}/books/${book}${suffix}`,
    islamicPath: `/collections/${slug}/books/${book}${suffix}`,
  }
}

async function fetchFromProvider<T>(
  provider: HadithProvider,
  sunnahPath: string,
  islamicPath: string,
): Promise<T> {
  if (provider === 'sunnah.com') {
    return apiFetch<T>(`${PROXY_BASE}${sunnahPath}`, {
      source: 'sunnah.com',
    })
  }

  return apiFetch<T>(`${ISLAMIC_APP_BASE}${islamicPath}`, {
    source: 'islamic.app',
  })
}

async function withProviderFallback<T>(
  sunnahPath: string,
  islamicPath: string,
): Promise<{ data: T; provider: HadithProvider }> {
  if (hasSunnahProxy()) {
    try {
      const data = await fetchFromProvider<T>('sunnah.com', sunnahPath, islamicPath)
      return { data, provider: 'sunnah.com' }
    } catch {
      // Fall through to mirror API.
    }
  }

  const data = await fetchFromProvider<T>('islamic.app', sunnahPath, islamicPath)
  return { data, provider: 'islamic.app' }
}

function unwrapBooks(payload: BooksResponse | unknown[]): unknown[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const record = payload as BooksResponse
    if (Array.isArray(record.data)) return record.data
    if (Array.isArray(record.books)) return record.books
  }
  return []
}

function unwrapChapters(payload: ChaptersResponse | unknown[]): unknown[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const record = payload as ChaptersResponse
    if (Array.isArray(record.data)) return record.data
    if (Array.isArray(record.chapters)) return record.chapters
  }
  return []
}

function unwrapHadiths(payload: HadithListResponse | unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const record = payload as HadithListResponse
    if (Array.isArray(record.hadiths)) return record.hadiths
    if (record.data && Array.isArray(record.data.hadiths)) return record.data.hadiths
  }
  return []
}

function unwrapSingleHadith(payload: unknown): unknown | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as { data?: unknown }
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data
  }
  if ('hadithNumber' in record || 'hadithnumber' in record) return payload
  return null
}

export async function getCollectionBooks(collectionId: string): Promise<HadithBook[]> {
  const route = getSunnahRoute(collectionId)
  if (!route) return []

  const { sunnahPath, islamicPath } = buildBooksListPaths(route)
  const { data } = await withProviderFallback<ApiEnvelope<unknown[]> | unknown[]>(
    sunnahPath,
    islamicPath,
  )

  const raw = unwrapBooks(data)
  const books = raw.map((book) => parseHadithBook(book as Parameters<typeof parseHadithBook>[0]))
  const normalized = dedupeBooks(
    books.map((book) => ({
      ...book,
      collection: collectionId,
    })),
  )

  if (route.fortyBookNumber) {
    return normalized.filter((book) => book.bookNumber === route.fortyBookNumber)
  }

  return normalized
}

export async function getCollectionBook(
  collectionId: string,
  bookNumber: string,
): Promise<HadithBook | null> {
  const route = getSunnahRoute(collectionId)
  const resolvedBook = route ? resolveBookNumber(route, bookNumber) ?? bookNumber : bookNumber
  const books = await getCollectionBooks(collectionId)
  return books.find((book) => book.bookNumber === resolvedBook) ?? null
}

export async function getBookChapters(
  collectionId: string,
  bookNumber: string,
): Promise<HadithChapter[]> {
  const route = getSunnahRoute(collectionId)
  if (!route) return []

  const { sunnahPath, islamicPath } = buildBookResourcePaths(route, bookNumber, '/chapters')
  const { data } = await withProviderFallback<ApiEnvelope<unknown[]> | unknown[]>(
    sunnahPath,
    islamicPath,
  )

  const raw = unwrapChapters(data)
  return raw.map((chapter) =>
    parseHadithChapter(chapter as Parameters<typeof parseHadithChapter>[0]),
  )
}

function resolveHadithListTotal(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as HadithListResponse
  if (typeof record.data?.total === 'number') return record.data.total
  if (typeof record.total === 'number') return record.total
  return null
}

async function fetchBookHadithPage(
  collectionId: string,
  bookNumber: string,
  limit: number,
  offset: number,
): Promise<{ hadiths: HadithEntry[]; total: number | null }> {
  const route = getSunnahRoute(collectionId)
  if (!route) return { hadiths: [], total: 0 }

  const query = `?limit=${limit}&offset=${offset}`
  const { sunnahPath, islamicPath } = buildBookResourcePaths(route, bookNumber, `/hadiths${query}`)

  const { data, provider } = await withProviderFallback<HadithListResponse>(sunnahPath, islamicPath)

  const raw = unwrapHadiths(data)
  const hadiths = raw.map((hadith) =>
    parseApiHadith(
      hadith as Parameters<typeof parseApiHadith>[0],
      collectionId,
      provider,
    ),
  )

  return {
    hadiths,
    total: resolveHadithListTotal(data),
  }
}

export async function getBookHadiths(
  collectionId: string,
  bookNumber: string,
  options?: { limit?: number; offset?: number; fetchAll?: boolean },
): Promise<{ hadiths: HadithEntry[]; total: number }> {
  const route = getSunnahRoute(collectionId)
  if (!route) return { hadiths: [], total: 0 }

  const pageSize = Math.min(options?.limit ?? 100, 100)
  const startOffset = options?.offset ?? 0

  if (!options?.fetchAll) {
    const page = await fetchBookHadithPage(collectionId, bookNumber, pageSize, startOffset)
    return { hadiths: page.hadiths, total: page.total ?? page.hadiths.length }
  }

  const all: HadithEntry[] = []
  let offset = 0
  let total: number | null = null

  while (true) {
    const page = await fetchBookHadithPage(collectionId, bookNumber, pageSize, offset)
    if (page.total != null) total = page.total
    if (page.hadiths.length === 0) break
    all.push(...page.hadiths)
    offset += page.hadiths.length
    if (total != null && all.length >= total) break
    if (page.hadiths.length < pageSize) break
    if (offset > 20_000) break
  }

  return { hadiths: all, total: total ?? all.length }
}

export async function getSunnahHadith(
  collectionId: string,
  hadithId: string,
  bookNumber?: string,
): Promise<HadithEntry | null> {
  const route = getSunnahRoute(collectionId)
  if (!route) return null

  const resolvedBook = resolveBookNumber(route, bookNumber)
  if (!resolvedBook) return null

  const id = hadithId.trim()
  if (!id) return null

  const encodedId = encodeURIComponent(id)
  const { sunnahPath, islamicPath } = buildBookResourcePaths(
    route,
    resolvedBook,
    `/hadiths/${encodedId}`,
  )

  try {
    const { data, provider } = await withProviderFallback<{ data?: unknown } | unknown>(
      sunnahPath,
      islamicPath,
    )

    const payload = unwrapSingleHadith(data)
    if (!payload || typeof payload !== 'object') return null

    return parseApiHadith(
      payload as Parameters<typeof parseApiHadith>[0],
      collectionId,
      provider,
    )
  } catch {
    return null
  }
}

export function getHadithProviderLabel(): string {
  return hasSunnahProxy() ? 'sunnah.com' : 'islamic.app (sunnah.com mirror)'
}
