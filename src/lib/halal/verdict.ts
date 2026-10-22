import { collectENumbers } from './parseIngredients'
import { lookupENumber } from './eNumbers'
import type { AdditiveResult, HalalStatus, ProductVerdict } from './types'

const STATUS_PRIORITY: Record<HalalStatus, number> = {
  haram: 4,
  mushbooh: 3,
  unknown: 2,
  halal: 1,
}

export function resolveAdditive(code: string): AdditiveResult {
  const entry = lookupENumber(code)
  if (!entry) {
    return { code, status: 'unknown' }
  }

  return {
    code: entry.code,
    status: entry.status,
    name: entry.name,
    source: entry.source,
    notes: entry.notes,
  }
}

export function aggregateVerdict(
  additives: AdditiveResult[],
  hasHalalLabel = false,
): ProductVerdict {
  if (additives.length === 0) {
    return hasHalalLabel ? 'halal' : 'unknown'
  }

  let worst: HalalStatus = 'halal'
  for (const additive of additives) {
    if (STATUS_PRIORITY[additive.status] > STATUS_PRIORITY[worst]) {
      worst = additive.status
    }
  }

  return worst
}

export function hasHalalCertificationLabel(labelsTags: string[] | undefined): boolean {
  if (!labelsTags?.length) return false
  return labelsTags.some((tag) => {
    const normalized = tag.toLowerCase()
    if (normalized.includes('non-halal') || normalized.includes('not-halal')) return false
    return (
      normalized === 'halal' ||
      normalized.endsWith(':halal') ||
      normalized.includes('halal-certified') ||
      normalized.includes('certified-halal') ||
      normalized.includes('en:halal')
    )
  })
}

export interface ProductAnalysis {
  additives: AdditiveResult[]
  verdict: ProductVerdict
  hasHalalLabel: boolean
  eCodesFound: string[]
}

export function analyzeProduct(params: {
  ingredientsText?: string
  additiveTags?: string[]
  labelsTags?: string[]
}): ProductAnalysis {
  const eCodesFound = collectENumbers({
    ingredientsText: params.ingredientsText,
    additiveTags: params.additiveTags,
  })
  const additives = eCodesFound.map(resolveAdditive)
  const hasHalalLabel = hasHalalCertificationLabel(params.labelsTags)
  const verdict = aggregateVerdict(additives, hasHalalLabel)

  return { additives, verdict, hasHalalLabel, eCodesFound }
}
