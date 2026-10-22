import rawData from '@/lib/data/e_numbers.json'
import type { ENumberEntry, HalalStatus } from './types'

type RawDatabase = Record<string, Omit<ENumberEntry, 'code'> & { code?: string }>

const database: Map<string, ENumberEntry> = new Map()

for (const [key, value] of Object.entries(rawData as RawDatabase)) {
  const code = value.code ?? key.toUpperCase()
  database.set(code, { ...value, code })
}

export function lookupENumber(code: string): ENumberEntry | undefined {
  const normalized = code.trim().toUpperCase().replace(/^E/i, '')
  return database.get(`E${normalized}`)
}

export function searchENumbers(query: string, limit = 20): ENumberEntry[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const normalizedQuery = trimmed.toUpperCase().replace(/^E/i, '')
  const results: ENumberEntry[] = []

  for (const entry of database.values()) {
    const codeDigits = entry.code.replace(/^E/i, '')
    const matchesCode = codeDigits.startsWith(normalizedQuery)
    const matchesName = entry.name.toUpperCase().includes(trimmed.toUpperCase())
    if (matchesCode || matchesName) {
      results.push(entry)
    }
    if (results.length >= limit) break
  }

  return results.sort((a, b) => a.code.localeCompare(b.code))
}

export { type ENumberEntry, type HalalStatus }
