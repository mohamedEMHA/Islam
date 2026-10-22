/**
 * Normalize user input or extracted text to standard E-code format (e.g. E471).
 */
export function normalizeENumber(input: string): string | null {
  const trimmed = input.trim().toUpperCase()
  const withoutPrefix = trimmed.replace(/^E/i, '')
  if (!/^\d{3,4}$/.test(withoutPrefix)) return null
  return `E${withoutPrefix}`
}

/**
 * Extract E-numbers from free-text ingredients (E120, e471, 120, etc.).
 */
export function extractENumbers(text: string): string[] {
  const found = new Set<string>()
  const pattern = /\bE?\s*(\d{3,4})\b/gi
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const normalized = normalizeENumber(match[1] ?? '')
    if (normalized) found.add(normalized)
  }

  return [...found].sort()
}

/**
 * Parse Open Food Facts additive tags (en:e120, en:e471, ...).
 */
export function extractENumbersFromTags(tags: string[]): string[] {
  const found = new Set<string>()

  for (const tag of tags) {
    const match = tag.match(/^en:e(\d{3,4})$/i)
    if (match?.[1]) {
      const normalized = normalizeENumber(match[1])
      if (normalized) found.add(normalized)
    }
  }

  return [...found].sort()
}

export interface ENnumberSources {
  ingredientsText?: string
  additiveTags?: string[]
}

/**
 * Merge E-numbers from ingredients text and OFF additive tags.
 */
export function collectENumbers(sources: ENnumberSources): string[] {
  const all = new Set<string>()

  if (sources.ingredientsText) {
    for (const code of extractENumbers(sources.ingredientsText)) {
      all.add(code)
    }
  }

  if (sources.additiveTags) {
    for (const code of extractENumbersFromTags(sources.additiveTags)) {
      all.add(code)
    }
  }

  return [...all].sort()
}
