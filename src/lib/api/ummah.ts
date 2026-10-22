import { apiFetch, ApiError } from './client'

const UMMAH_BASE = '/api/ummah'
const SOURCE = 'UmmahAPI'

function buildUmmahHeaders(extra?: HeadersInit): HeadersInit {
  const headers = new Headers(extra)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  return headers
}

async function ummahFetch<T>(
  path: string,
  options?: RequestInit & { retries?: number },
): Promise<T> {
  if (/^https?:\/\//i.test(path)) {
    throw new ApiError('Absolute URLs are not allowed for UmmahAPI proxy', undefined, SOURCE)
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${UMMAH_BASE}${normalizedPath}`

  return apiFetch<T>(url, {
    ...options,
    headers: buildUmmahHeaders(options?.headers),
    source: SOURCE,
  })
}

interface UmmahEnvelope<T> {
  success: boolean
  service: string
  data: T
}

export interface IslamicName {
  id: number
  name: string
  arabic: string
  gender: 'male' | 'female'
  meaning: string
  origin: string
  root: string | null
  note: string
}

export interface GetIslamicNamesParams {
  gender?: 'male' | 'female'
  origin?: string
  search?: string
  page?: number
  limit?: number
  signal?: AbortSignal
}

async function fetchIslamicNamesPage(params: GetIslamicNamesParams) {
  const search = new URLSearchParams()
  if (params.gender) search.set('gender', params.gender)
  if (params.origin) search.set('origin', params.origin)
  if (params.search) search.set('search', params.search)
  if (params.page) search.set('page', String(params.page))
  search.set('limit', String(params.limit ?? 210))

  const query = search.toString()
  const result = await ummahFetch<UmmahEnvelope<{
    total: number
    page: number
    limit: number
    total_pages: number
    names: IslamicName[]
  }>>(`/names${query ? `?${query}` : ''}`, { signal: params.signal })

  if (!result.success) {
    throw new ApiError('Failed to load Islamic names', undefined, SOURCE)
  }

  return result.data
}

export async function getIslamicNames(params: GetIslamicNamesParams = {}): Promise<IslamicName[]> {
  const firstPage = await fetchIslamicNamesPage(params)

  if (firstPage.total_pages <= 1) {
    return firstPage.names
  }

  const CONCURRENCY = 3
  const pages: IslamicName[][] = [firstPage.names]
  const pageNumbers = Array.from({ length: firstPage.total_pages - 1 }, (_, index) => index + 2)

  for (let i = 0; i < pageNumbers.length; i += CONCURRENCY) {
    if (params.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    const batch = pageNumbers.slice(i, i + CONCURRENCY)
    const results = await Promise.all(
      batch.map((page) => fetchIslamicNamesPage({ ...params, page })),
    )
    for (const result of results) {
      pages.push(result.names)
    }
  }

  return pages.flat()
}

export function filterBabyNames(
  names: IslamicName[],
  search: string,
  letter: string | null,
): IslamicName[] {
  const query = search.trim().toLowerCase()

  return names.filter((name) => {
    const matchLetter = !letter || name.name.toUpperCase().startsWith(letter)
    const matchSearch =
      !query ||
      name.name.toLowerCase().includes(query) ||
      name.meaning.toLowerCase().includes(query) ||
      name.arabic.includes(search.trim()) ||
      name.origin.toLowerCase().includes(query) ||
      name.note.toLowerCase().includes(query)

    return matchLetter && matchSearch
  })
}

export type ZakatCurrency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'SAR'
  | 'AED'
  | 'EGP'
  | 'PKR'
  | 'MYR'
  | 'IDR'
  | 'TRY'
  | 'INR'

export const ZAKAT_CURRENCIES: ZakatCurrency[] = [
  'USD',
  'EUR',
  'GBP',
  'SAR',
  'AED',
  'EGP',
  'PKR',
  'MYR',
  'IDR',
  'TRY',
  'INR',
]

export type NisabStandard = 'gold' | 'silver'

export interface ZakatCalculatePayload {
  cash: number
  currency: ZakatCurrency
  gold_grams: number
  silver_grams: number
  stocks: number
  business_goods: number
  liabilities: number
  nisab_standard: NisabStandard
}

export interface ZakatCalculateInput {
  cash?: number
  goldGrams?: number
  silverGrams?: number
  stocks?: number
  businessGoods?: number
  liabilities?: number
  nisabType?: NisabStandard
  currency?: ZakatCurrency
}

export function toZakatCalculatePayload(input: ZakatCalculateInput): ZakatCalculatePayload {
  return {
    cash: input.cash ?? 0,
    currency: input.currency ?? 'USD',
    gold_grams: input.goldGrams ?? 0,
    silver_grams: input.silverGrams ?? 0,
    stocks: input.stocks ?? 0,
    business_goods: input.businessGoods ?? 0,
    liabilities: input.liabilities ?? 0,
    nisab_standard: input.nisabType ?? 'gold',
  }
}

export interface ZakatCalculateData {
  zakat_due: number
  zakat_due_formatted: string
  above_nisab: boolean
  nisab_standard: NisabStandard
  nisab_value: number
  nisab_gold_grams: number
  nisab_silver_grams: number
  rate: string
  breakdown: {
    cash: number
    gold_value: number
    silver_value: number
    stocks: number
    business_goods: number
    other_investments: number
    gross_wealth: number
    liabilities: number
    net_zakatable_wealth: number
  }
  note: string
  prices_used: {
    auto_filled: boolean
    currency: string
    gold_price_per_gram: number
    silver_price_per_gram: number
    source: string
    as_of: string
    is_fallback: boolean
  }
}

export async function calculateZakatViaUmmah(
  payload: ZakatCalculatePayload,
  signal?: AbortSignal,
): Promise<ZakatCalculateData> {
  const result = await ummahFetch<UmmahEnvelope<ZakatCalculateData>>('/zakat/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!result.success) {
    throw new ApiError('Failed to calculate Zakat', undefined, SOURCE)
  }

  return result.data
}

export interface UmmahQuranAyahData {
  surah: {
    number: number
    name_arabic: string
    name_english: string
    name_translation: string
  }
  verse: {
    verse_key: string
    ayah: number
    arabic: string
    transliteration: string
    translations: Partial<Record<
      | 'sahih_international'
      | 'pickthall'
      | 'yusuf_ali'
      | 'urdu'
      | 'turkish'
      | 'indonesian'
      | 'french'
      | 'german'
      | 'bengali'
      | 'spanish'
      | 'malay'
      | 'bosnian',
      string
    >>
  }
}

export interface UmmahHadithData {
  id: string
  collection: string
  collection_name: string
  hadithnumber: number
  arabic: string
  english: string
  grade: string
}

export interface UmmahDuaData {
  id: number
  category: string
  title: string
  arabic: string
  transliteration: string
  translation: string
  source: string
  repeat: number
}

export interface DailyVerseFeed {
  type: 'verse'
  arabic: string
  transliteration?: string
  text: string
  reference: string
  surah: number
  ayah: number
}

export interface DailyHadithFeed {
  type: 'hadith'
  arabic: string
  text: string
  reference: string
  grade?: string
}

export interface DailyAdhkarFeed {
  type: 'adhkar'
  category: 'morning' | 'evening' | 'after_prayer'
  title: string
  arabic: string
  transliteration: string
  text: string
  reference: string
  repeat?: number
}

export type DailySpiritualFeed = DailyVerseFeed | DailyHadithFeed | DailyAdhkarFeed

export async function getUmmahQuranAyah(
  surah: number,
  ayah: number,
  signal?: AbortSignal,
): Promise<UmmahQuranAyahData> {
  const result = await ummahFetch<UmmahEnvelope<UmmahQuranAyahData>>(
    `/quran/surah/${surah}/ayah/${ayah}`,
    { signal },
  )

  if (!result.success) {
    throw new ApiError('Failed to load Quran ayah', undefined, SOURCE)
  }

  return result.data
}

export async function getUmmahHadith(
  collection: string,
  number: number,
  signal?: AbortSignal,
): Promise<UmmahHadithData> {
  const result = await ummahFetch<UmmahEnvelope<UmmahHadithData>>(
    `/hadith/${collection}/${number}`,
    { signal },
  )

  if (!result.success) {
    throw new ApiError('Failed to load hadith', undefined, SOURCE)
  }

  return result.data
}

export async function getUmmahDuasByCategory(
  categoryId: string,
  signal?: AbortSignal,
): Promise<UmmahDuaData[]> {
  const result = await ummahFetch<
    UmmahEnvelope<{
      category: { id: string; name: string; description: string }
      total: number
      duas: UmmahDuaData[]
    }>
  >(`/duas/category/${categoryId}`, { signal })

  if (!result.success) {
    throw new ApiError('Failed to load duas category', undefined, SOURCE)
  }

  return result.data.duas
}
