import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue
      walk(p, acc)
    } else if (/\.(tsx?|jsx?)$/.test(name)) {
      acc.push(p)
    }
  }
  return acc
}

const icons = new Set()
const patterns = [
  /material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*</g,
  /icon:\s*['"]([a-z0-9_]+)['"]/g,
  /icon=["']([a-z0-9_]+)["']/g,
  /\{item\.icon\}/g,
]

for (const file of walk('src')) {
  const text = readFileSync(file, 'utf8')
  for (const re of patterns.slice(0, 3)) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text))) icons.add(m[1])
  }
}

// Dynamic icon text content between tags spanning a newline
for (const file of walk('src')) {
  const text = readFileSync(file, 'utf8')
  const re = /material-symbols-outlined[^>]*>\s*\n?\s*([a-z0-9_]+)\s*</g
  let m
  while ((m = re.exec(text))) icons.add(m[1])
}

const sorted = [...icons].sort()
console.log(sorted.join(','))
console.log('COUNT', sorted.length)
