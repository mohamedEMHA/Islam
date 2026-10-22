import type { ZakatCalculateData } from '@/lib/api/ummah'
import type { MetalSpotPrices } from '@/lib/api/xaus'

export const TROY_OZ_TO_GRAM = 31.1034768

export const METAL_PRICE_TOLERANCE_PERCENT = 1.5

export interface MetalPricePair {
  goldPerGram: number
  silverPerGram: number
}

export interface MetalPriceVerification {
  goldVerified: boolean
  silverVerified: boolean
  verified: boolean
  tolerancePercent: number
}

export function priceWithinTolerance(
  primary: number,
  secondary: number,
  tolerancePercent = METAL_PRICE_TOLERANCE_PERCENT,
): boolean {
  if (primary <= 0 || secondary <= 0) return false
  const diff = Math.abs(primary - secondary) / Math.max(primary, secondary)
  return diff <= tolerancePercent / 100
}

export function verifyMetalPrices(
  primary: MetalPricePair,
  secondary: MetalPricePair,
  tolerancePercent = METAL_PRICE_TOLERANCE_PERCENT,
): MetalPriceVerification {
  const goldVerified = priceWithinTolerance(
    primary.goldPerGram,
    secondary.goldPerGram,
    tolerancePercent,
  )
  const silverVerified = priceWithinTolerance(
    primary.silverPerGram,
    secondary.silverPerGram,
    tolerancePercent,
  )

  return {
    goldVerified,
    silverVerified,
    verified: goldVerified && silverVerified,
    tolerancePercent,
  }
}

export function mapUmmahMetalPrices(data: ZakatCalculateData): MetalPricePair {
  return {
    goldPerGram: data.prices_used.gold_price_per_gram,
    silverPerGram: data.prices_used.silver_price_per_gram,
  }
}

export function mapXausMetalPrices(data: MetalSpotPrices): MetalPricePair {
  return {
    goldPerGram: data.goldPerGram,
    silverPerGram: data.silverPerGram,
  }
}
