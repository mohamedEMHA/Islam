/**
 * Build platform favicons from public/logo.png
 * Covers: browser tabs, Google Search (>48px), Apple home screen, PWA/maskable.
 */
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = resolve(root, 'public')
const iconsDir = resolve(publicDir, 'icons')
const SOURCE = resolve(publicDir, 'logo.png')
const CREAM = { r: 247, g: 243, b: 234, alpha: 1 }

async function opaqueOnCream(size, outPath, padRatio) {
  const inner = Math.round(size * (1 - padRatio * 2))
  const mark = await sharp(SOURCE)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: CREAM },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .png({ compressionLevel: 9, palette: true, colors: 64 })
    .toFile(outPath)

  console.log(`wrote ${outPath}`)
}

async function transparent(size, outPath, { palette = false } = {}) {
  let pipeline = sharp(SOURCE).resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: sharp.kernel.lanczos3,
  })

  pipeline = palette
    ? pipeline.png({ compressionLevel: 9, palette: true, colors: 64 })
    : pipeline.png({ compressionLevel: 9 })

  await pipeline.toFile(outPath)
  console.log(`wrote ${outPath}`)
}

async function writeSvgWithEmbeddedMark() {
  // Exact brand mark as SVG favicon (modern browsers). Raster embed keeps fidelity
  // without messy auto-trace paths. Dark tabs still get a cream plate underneath.
  const mark128 = await sharp(SOURCE)
    .resize(112, 112, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9, palette: true, colors: 48 })
    .toBuffer()

  const b64 = mark128.toString('base64')
  // Cream plate always: the mark is dark green line art and must stay readable
  // on both light and dark browser chrome.
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128" role="img" aria-label="Islam">
  <rect fill="#F7F3EA" width="128" height="128" rx="24"/>
  <image x="8" y="8" width="112" height="112" href="data:image/png;base64,${b64}" xlink:href="data:image/png;base64,${b64}"/>
</svg>
`
  writeFileSync(resolve(publicDir, 'favicon.svg'), svg)
  console.log(`wrote public/favicon.svg (${Buffer.byteLength(svg)} bytes)`)
}

async function main() {
  // Tab / Google: cream plate for contrast on light + dark browser chrome.
  await opaqueOnCream(16, resolve(publicDir, 'favicon_16.png'), 0.06)
  await opaqueOnCream(32, resolve(publicDir, 'favicon_32.png'), 0.06)
  await opaqueOnCream(48, resolve(publicDir, 'favicon_48.png'), 0.06)

  // Transparent masters for in-app mark + PWA "any"
  await transparent(192, resolve(iconsDir, 'icon_192.png'))
  await transparent(512, resolve(iconsDir, 'icon_512.png'))

  // Apple home screen + Android maskable (opaque cream + safe padding)
  await opaqueOnCream(180, resolve(publicDir, 'apple_touch_icon.png'), 0.1)
  await opaqueOnCream(512, resolve(iconsDir, 'icon_512_maskable.png'), 0.18)
  await opaqueOnCream(512, resolve(publicDir, 'brand', 'tab.png'), 0.08)

  const ico = await pngToIco([
    resolve(publicDir, 'favicon_16.png'),
    resolve(publicDir, 'favicon_32.png'),
    resolve(publicDir, 'favicon_48.png'),
  ])
  writeFileSync(resolve(publicDir, 'favicon.ico'), ico)
  console.log(`wrote public/favicon.ico (${ico.length} bytes)`)

  await writeSvgWithEmbeddedMark()

  const preview = resolve(iconsDir, '_svg_preview.png')
  if (existsSync(preview)) unlinkSync(preview)
  const cleanScript = resolve(root, 'scripts', 'clean_favicon_svg.mjs')
  if (existsSync(cleanScript)) unlinkSync(cleanScript)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
