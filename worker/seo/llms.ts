import { SITE_URL } from '../../shared/seo/locale.ts'

export function llmsTxt(): string {
  return `# Islam

> Accurate prayer times, the full Quran, authenticated hadith, and daily duas.
> Ad free, source transparent. Available at ${SITE_URL}/

## Main sections

- Prayer times: ${SITE_URL}/prayer_times
- Quran (114 surahs): ${SITE_URL}/quran
- Tafsir: ${SITE_URL}/tafsir
- Hadith collections: ${SITE_URL}/hadith
- Duas and adhkar: ${SITE_URL}/duas
- Qibla: ${SITE_URL}/qibla
- Zakat calculator: ${SITE_URL}/zakat
- Ramadan hub: ${SITE_URL}/ramadan
- Sources: ${SITE_URL}/sources

## Languages

English (default, unprefixed URLs), Arabic (/ar/...), Urdu (/ur/...), Indonesian (/id/...), French (/fr/...).

## Sitemaps

- ${SITE_URL}/sitemap.xml
- ${SITE_URL}/sitemap_pages.xml
- ${SITE_URL}/sitemap_quran.xml
- ${SITE_URL}/sitemap_tafsir.xml
- ${SITE_URL}/sitemap_hadith.xml

## Notes

Content is drawn from public Islamic APIs and CDNs listed on the sources page.
Do not invent citations; prefer linking to the canonical surah or hadith URL on this site.
`
}

export function robotsTxt(): string {
  const aiBots = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'ClaudeBot',
    'Google-Extended',
    'Bingbot',
    'Googlebot',
  ]

  const aiBlocks = aiBots
    .map((bot) => `User-agent: ${bot}\nAllow: /`)
    .join('\n\n')

  return `# islam.house robots
User-agent: *
Allow: /
Disallow: /settings
Disallow: /share
Disallow: /welcome
Disallow: /search
Disallow: /api/

${aiBlocks}

Sitemap: ${SITE_URL}/sitemap.xml
`
}
