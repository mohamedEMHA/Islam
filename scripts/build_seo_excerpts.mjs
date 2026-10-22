/**
 * Fetches the first 3 ayahs (Arabic + English Sahih) for all 114 surahs
 * and writes shared/seo/surah_excerpts.json for Worker SEO enrichment.
 *
 * Run: node scripts/build_seo_excerpts.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'shared/seo')
const outFile = resolve(outDir, 'surah_excerpts.json')

const AYAH_LIMIT = 3
const PAUSE_MS = 120

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchSurah(num, edition) {
  const url = `https://api.alquran.cloud/v1/surah/${num}${edition ? `/${edition}` : ''}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const body = await res.json()
  if (body.code !== 200 || !body.data?.ayahs) {
    throw new Error(`Unexpected payload for ${url}`)
  }
  return body.data.ayahs.slice(0, AYAH_LIMIT).map((a) => ({
    numberInSurah: a.numberInSurah,
    text: a.text,
  }))
}

async function main() {
  /** @type {Record<string, { ar: Array<{numberInSurah:number,text:string}>, en: Array<{numberInSurah:number,text:string}> }>} */
  const excerpts = {}

  for (let num = 1; num <= 114; num++) {
    process.stdout.write(`Surah ${num}/114… `)
    const [ar, en] = await Promise.all([fetchSurah(num, ''), fetchSurah(num, 'en.sahih')])
    excerpts[String(num)] = { ar, en }
    console.log('ok')
    await sleep(PAUSE_MS)
  }

  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, `${JSON.stringify(excerpts)}\n`, 'utf8')
  console.log(`Wrote ${outFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
