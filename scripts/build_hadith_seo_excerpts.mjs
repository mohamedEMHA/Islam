/**
 * Fetches hadith body excerpts for sitemap entry ranges and merges into
 * shared/seo/hadith_excerpts.json for Worker SEO enrichment (no request-time API).
 *
 * Requires SUNNAH_API_KEY. Run: node scripts/build_hadith_seo_excerpts.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'shared/seo')
const outFile = resolve(outDir, 'hadith_excerpts.json')

const HADITH_ENTRY_RANGE = {
  bukhari: 100,
  muslim: 100,
  abudawud: 80,
  tirmidhi: 80,
  nasai: 80,
  ibnmajah: 80,
  malik: 80,
  nawawi: 42,
  qudsi: 40,
  dehlawi: 40,
}

const PAUSE_MS = 150
const MAX_LEN = 400

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function clip(body) {
  return body.length > MAX_LEN ? `${body.slice(0, MAX_LEN)}…` : body
}

async function fetchHadith(collection, n, apiKey) {
  const url = `https://api.sunnah.com/v1/collections/${collection}/hadiths/${n}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'X-API-KEY': apiKey },
  })
  if (!res.ok) return null
  const data = await res.json()
  const body = data.hadith?.[0]?.body
  if (!body) return null
  return clip(stripHtml(body))
}

async function main() {
  const apiKey = process.env.SUNNAH_API_KEY
  if (!apiKey) {
    console.error('Set SUNNAH_API_KEY to build hadith SEO excerpts.')
    process.exit(1)
  }

  /** @type {Record<string, string>} */
  const excerpts = existsSync(outFile)
    ? JSON.parse(readFileSync(outFile, 'utf8'))
    : {}

  for (const [collection, max] of Object.entries(HADITH_ENTRY_RANGE)) {
    for (let n = 1; n <= max; n++) {
      const key = `${collection}/${n}`
      if (excerpts[key]) continue
      process.stdout.write(`${key}… `)
      const text = await fetchHadith(collection, n, apiKey)
      if (text) {
        excerpts[key] = text
        console.log('ok')
      } else {
        console.log('skip')
      }
      await sleep(PAUSE_MS)
    }
  }

  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, `${JSON.stringify(excerpts, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${Object.keys(excerpts).length} excerpts to ${outFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
