/**
 * Read-only i18n audit: keys identical to en (outside brand allowlist).
 * Usage: node scripts/i18n_audit.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const localesDir = path.join(root, 'src', 'i18n', 'locales')
const allowPath = path.join(root, 'src', 'test', 'i18nAllowIdentical.json')

function flattenValues(value, prefix = '') {
  if (value === null || typeof value !== 'object') {
    return prefix ? { [prefix]: value } : {}
  }
  if (Array.isArray(value)) {
    return value.reduce((acc, item, index) => {
      Object.assign(acc, flattenValues(item, `${prefix}[${index}]`))
      return acc
    }, {})
  }
  return Object.entries(value).reduce((acc, [key, nested]) => {
    const p = prefix ? `${prefix}.${key}` : key
    Object.assign(acc, flattenValues(nested, p))
    return acc
  }, {})
}

const allow = new Set(JSON.parse(fs.readFileSync(allowPath, 'utf8')))
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'))
const enValues = flattenValues(en)

const mustDiffer = ['common.on', 'common.weekdays.short.sun', 'common.weekdays.short.mon']

let exitCode = 0
for (const code of ['ar', 'ur', 'id', 'fr']) {
  const locale = JSON.parse(fs.readFileSync(path.join(localesDir, `${code}.json`), 'utf8'))
  const values = flattenValues(locale)
  const identical = Object.keys(enValues).filter((key) => {
    if (allow.has(key)) return false
    const a = enValues[key]
    const b = values[key]
    return (
      typeof a === 'string' &&
      typeof b === 'string' &&
      a.trim().length > 1 &&
      /[A-Za-z]{3,}/.test(a) &&
      a === b
    )
  })

  console.log(`\n=== ${code} ===`)
  console.log(`identical to en (not allowlisted): ${identical.length}`)
  if (identical.length) {
    console.log(identical.slice(0, 40).join('\n'))
    if (identical.length > 40) console.log(`… +${identical.length - 40} more`)
  }

  for (const key of mustDiffer) {
    if (values[key] === enValues[key]) {
      console.error(`FAIL: ${code} ${key} still equals English`)
      exitCode = 1
    }
  }
}

process.exit(exitCode)
