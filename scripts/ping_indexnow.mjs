/**
 * Notify IndexNow (Bing/Yandex) of key URLs after deploy.
 * Usage: node scripts/ping_indexnow.mjs
 */
const SITE = 'https://islam.house'
const KEY = 'islamhouseindexnow9f3a2c1b'

const urls = [
  `${SITE}/`,
  `${SITE}/prayer_times`,
  `${SITE}/quran`,
  `${SITE}/quran/1`,
  `${SITE}/quran/36`,
  `${SITE}/hadith`,
  `${SITE}/hadith/bukhari`,
  `${SITE}/duas`,
  `${SITE}/sources`,
  `${SITE}/sitemap.xml`,
  `${SITE}/llms.txt`,
  `${SITE}/prayer_times/london`,
  `${SITE}/prayer_times/jakarta`,
  `${SITE}/ramadan/2027/london`,
]

const payload = {
  host: 'islam.house',
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList: urls,
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
})

console.log('IndexNow status', res.status)
if (!res.ok && res.status !== 202) {
  const text = await res.text().catch(() => '')
  console.error(text)
  process.exit(1)
}
