import { apiFetch, ApiError } from './client'

export interface OpenFoodFactsProductPayload {
  product_name?: string
  product_name_en?: string
  image_url?: string
  image_front_url?: string
  ingredients_text?: string
  ingredients_text_en?: string
  additives_tags?: string[]
  labels_tags?: string[]
}

export interface OpenFoodFactsResponse {
  code: string
  status: 0 | 1
  status_verbose?: string
  product?: OpenFoodFactsProductPayload
}

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2/product'
const CACHE_PREFIX = 'off_product_'
const CACHE_TTL_MS = 30 * 60 * 1000

interface CachedEntry {
  fetchedAt: number
  data: OpenFoodFactsResponse
}

function normalizeBarcode(barcode: string): string {
  return barcode.replace(/\D/g, '')
}

function readCache(barcode: string): OpenFoodFactsResponse | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + barcode)
    if (!raw) return null
    const entry = JSON.parse(raw) as CachedEntry
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + barcode)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

function writeCache(barcode: string, data: OpenFoodFactsResponse): void {
  try {
    const entry: CachedEntry = { fetchedAt: Date.now(), data }
    sessionStorage.setItem(CACHE_PREFIX + barcode, JSON.stringify(entry))
  } catch {
    // sessionStorage may be full or unavailable
  }
}

export function isValidBarcode(barcode: string): boolean {
  const digits = normalizeBarcode(barcode)
  return digits.length >= 8 && digits.length <= 14
}

export async function fetchProductByBarcode(
  barcode: string,
  signal?: AbortSignal,
): Promise<OpenFoodFactsResponse> {
  const normalized = normalizeBarcode(barcode)
  if (!isValidBarcode(normalized)) {
    throw new ApiError('Invalid barcode format', 400, 'Open Food Facts')
  }

  const cached = readCache(normalized)
  if (cached) return cached

  const data = await apiFetch<OpenFoodFactsResponse>(
    `${OFF_API_BASE}/${normalized}`,
    {
      source: 'Open Food Facts',
      retries: 2,
      signal,
      headers: { Accept: 'application/json' },
    },
  )

  if (data.status !== 1 || !data.product) {
    throw new ApiError('Product not found', 404, 'Open Food Facts')
  }

  writeCache(normalized, data)
  return data
}

export function getProductDisplayName(product: OpenFoodFactsProductPayload): string {
  return (
    product.product_name?.trim() ||
    product.product_name_en?.trim() ||
    'Unknown product'
  )
}

export function getProductImageUrl(product: OpenFoodFactsProductPayload): string | undefined {
  return product.image_url || product.image_front_url
}

export function getIngredientsText(product: OpenFoodFactsProductPayload): string | undefined {
  const text = product.ingredients_text?.trim() || product.ingredients_text_en?.trim()
  return text || undefined
}

export const OPEN_FOOD_FACTS_ATTRIBUTION = {
  name: 'Open Food Facts',
  url: 'https://world.openfoodfacts.org',
  productUrl: (barcode: string) =>
    `https://world.openfoodfacts.org/product/${normalizeBarcode(barcode)}`,
}
