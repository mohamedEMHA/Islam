import fs from 'node:fs'

const path = './src/features/hadith/HadithReaderPage.tsx'
let s = fs.readFileSync(path, 'utf8')

const lines = s.split(/\n/)
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  if (line.includes('isnad.map') || (line.includes("t('common.previous')") && !line.includes('aria-label')) || (line.includes("t('common.next')") && line.includes('}'))) {
    const weird = [...line].filter((c) => c.charCodeAt(0) > 127)
    if (weird.length) {
      console.log(i + 1, JSON.stringify(line))
      console.log('  weird:', weird.map((c) => `U+${c.charCodeAt(0).toString(16).toUpperCase()}`).join(' '))
    }
  }
}

// Fix isnad join separator (any non-ascii between quotes in join)
s = s.replace(/\.join\('([^']*)'\)/g, (match, sep) => {
  if (/[^\x00-\x7F]/.test(sep)) {
    return ".join(' \\u2192 ')"
  }
  return match
})

// Fix previous/next lines that start with mojibake before t('common.previous')
s = s.replace(
  /^([ \t]*)[^\n]*\{t\('common\.previous'\)\}/gm,
  (match, indent) => {
    if (!/[^\x00-\x7F]/.test(match)) return match
    if (match.includes('material-symbols')) return match
    return `${indent}<span className="material-symbols-outlined text-sm rtl:rotate-180" aria-hidden>chevron_left</span>{' '}{t('common.previous')}`
  },
)

s = s.replace(
  /^([ \t]*)\{t\('common\.next'\)\}[^\n]*/gm,
  (match, indent) => {
    if (!/[^\x00-\x7F]/.test(match)) return match
    if (match.includes('material-symbols')) return match
    return `${indent}{t('common.next')}{' '}<span className="material-symbols-outlined text-sm rtl:rotate-180" aria-hidden>chevron_right</span>`
  },
)

fs.writeFileSync(path, s)
console.log('written')

// verify
const after = fs.readFileSync(path, 'utf8')
const remaining = [...after.matchAll(/[^\x00-\x7F]/g)].filter((m) => {
  const code = m[0].charCodeAt(0)
  // allow common punctuation we intentionally want? none for now - Arabic isn't in this file
  return true
})
console.log('non-ascii count', remaining.length)
for (const m of remaining.slice(0, 20)) {
  const i = m.index ?? 0
  console.log(JSON.stringify(after.slice(Math.max(0, i - 20), i + 20)))
}
