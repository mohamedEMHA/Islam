import { createRequire } from 'node:module'
import { writeFileSync, readFileSync, renameSync, statSync, readdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const require = createRequire(import.meta.url)

async function loadSharp() {
  try {
    return require('sharp')
  } catch {
    const { execSync } = await import('node:child_process')
    execSync('npm install --no-save sharp', { stdio: 'inherit' })
    return require('sharp')
  }
}

const sharp = await loadSharp()
const src = 'public/brand/screen.png'
const buf = readFileSync(src)

await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 72 }).toFile('public/brand/screen.webp')
await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).avif({ quality: 55 }).toFile('public/brand/screen.avif')
await sharp(buf)
  .resize({ width: 1600, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 80 })
  .toFile('public/brand/screen.png.tmp')
renameSync('public/brand/screen.png.tmp', src)

for (const f of ['public/brand/screen.webp', 'public/brand/screen.avif', src]) {
  console.log(f, Math.round(statSync(f).size / 1024) + 'KB')
}
