/**
 * Apply dotted-key i18n patches onto locale JSON files.
 * Usage: node scripts/apply_i18n_patches.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const localesDir = path.join(root, 'src', 'i18n', 'locales')

function setPath(obj, dotted, value) {
  const parts = dotted.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const next = parts[i + 1]
    const nextIsIndex = /^\d+$/.test(next)
    if (cur[key] == null) {
      cur[key] = nextIsIndex ? [] : {}
    }
    cur = cur[key]
  }
  const last = parts[parts.length - 1]
  cur[last] = value
}

function deepFillMissing(target, source) {
  if (source == null || typeof source !== 'object' || Array.isArray(source)) {
    return
  }
  for (const [key, value] of Object.entries(source)) {
    if (!(key in target)) {
      target[key] = structuredClone(value)
      continue
    }
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      target[key] !== null &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      deepFillMissing(target[key], value)
    } else if (Array.isArray(value) && Array.isArray(target[key]) && target[key].length < value.length) {
      for (let i = target[key].length; i < value.length; i++) {
        target[key][i] = structuredClone(value[i])
      }
    }
  }
}

function loadPatch(file) {
  return JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'i18n_patches', file), 'utf8'))
}

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'))
const patches = {
  ...loadPatch('fr_id_patch.json'),
}

const arUrPath = path.join(root, 'scripts', 'i18n_patches', 'ar_ur_patch.json')
if (fs.existsSync(arUrPath)) {
  Object.assign(patches, JSON.parse(fs.readFileSync(arUrPath, 'utf8')))
}

for (const [code, map] of Object.entries(patches)) {
  const file = path.join(localesDir, `${code}.json`)
  const locale = JSON.parse(fs.readFileSync(file, 'utf8'))
  deepFillMissing(locale, en)
  for (const [key, value] of Object.entries(map)) {
    setPath(locale, key, value)
  }
  fs.writeFileSync(file, `${JSON.stringify(locale, null, 2)}\n`, 'utf8')
  console.log(`updated ${code}: ${Object.keys(map).length} patched keys`)
}
