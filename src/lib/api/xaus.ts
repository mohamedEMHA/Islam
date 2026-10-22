import { apiFetch } from './client'
import { TROY_OZ_TO_GRAM } from '@/lib/utils/zakatPrices'

const XAUS_SPOT_URL = 'https://xaus.com/api/v1/spot'

export interface XausSpotResponse {
  xau: {
    price: number
    currency: string
    unit: string
  }
  per_gram_usd: number
  silver_usd_oz: number
  fx_rate: number
  fx_rates: Record<string, number>
  updated_at: string
  source: string
  price_source?: string
}

export interface MetalSpotPrices {
  goldPerGram: number
  silverPerGram: number
  currency: string
  updatedAt: string
  source: string
}

export async function getXausMetalPrices(
  currency = 'USD',
  signal?: AbortSignal,
): Promise<MetalSpotPrices> {
  const data = await apiFetch<XausSpotResponse>(
    `${XAUS_SPOT_URL}?currency=${encodeURIComponent(currency)}&unit=gram`,
    { source: 'XAUS.com', signal },
  )

  const fxRate = currency === 'USD' ? 1 : (data.fx_rates[currency] ?? data.fx_rate ?? 1)
  const goldPerGram = currency === 'USD' ? data.per_gram_usd : data.xau.price
  const silverPerGramUsd = data.silver_usd_oz / TROY_OZ_TO_GRAM
  const silverPerGram = silverPerGramUsd * fxRate

  return {
    goldPerGram,
    silverPerGram,
    currency,
    updatedAt: data.updated_at,
    source: data.source,
  }
}
