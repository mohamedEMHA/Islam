import fs from 'fs'
import path from 'path'

const dir = 'src/i18n/locales'

function deepMerge(base, target) {
  if (base === null || typeof base !== 'object' || Array.isArray(base)) {
    return target !== undefined ? target : base
  }
  const out = { ...target }
  for (const key of Object.keys(base)) {
    if (!(key in out)) out[key] = structuredClone(base[key])
    else if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      out[key] = deepMerge(base[key], out[key])
    }
  }
  return out
}

const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'))
for (const loc of ['ar', 'ur', 'id', 'fr']) {
  const p = path.join(dir, `${loc}.json`)
  const target = JSON.parse(fs.readFileSync(p, 'utf8'))
  fs.writeFileSync(p, JSON.stringify(deepMerge(en, target), null, 2) + '\n', 'utf8')
}
console.log('merged locales from en.json')
