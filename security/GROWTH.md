# Real users and growth ops

Measure humans with **Web Analytics (RUM)** only. Zone "Visitors" includes bots.

Domain stays **islam.house**. Display brand: **islam.house**.

## Feature flags (rollback)

| Var | Default | Effect |
|-----|---------|--------|
| `SEO_RICH_HTML` | `1` | Crawler-only rich surah/hadith HTML. Set `0` to disable. |
| `SEO_CITY_PAGES` | `1` | Index city pages + `sitemap_cities.xml`. Set `0` for noindex. |

See [ROLLBACK.md](./ROLLBACK.md).

## Search (Phase 0 checklist)

1. Google Search Console: submit `https://islam.house/sitemap.xml`.
2. Bing Webmaster Tools: import from GSC (feeds ChatGPT Search / Copilot).
3. Confirm IndexNow key at `https://islam.house/islamhouseindexnow9f3a2c1b.txt`.
4. Hreflang: check International / alternate reports in GSC.
5. Baseline sheet: [AI_VISIBILITY_BASELINE.md](./AI_VISIBILITY_BASELINE.md).

## AI search visibility

Allowed: OAI-SearchBot, ChatGPT-User, Perplexity*, Claude-SearchBot, Claude-User, Applebot, DuckAssistBot.

Blocked: GPTBot, ClaudeBot, CCBot, Bytespider, Google-Extended, and other training scrapers.

- `https://islam.house/llms.txt`
- `https://islam.house/llms-full.txt`
- Markdown: `Accept: text/markdown` on HTML routes

## Monthly ops (30 minutes, do not rebuild SEO)

1. GSC: impressions, CTR, coverage errors.
2. Bing: indexed pages.
3. Re-run 20 prompts × 3 (AI_VISIBILITY_BASELINE.md); note citation rate.
4. CF Analytics: referrers from chatgpt.com / perplexity.ai / gemini.google.com.
5. Fix root causes only; do not re-architect SEO monthly.

## Off-site durable assets (once)

1. **Embed widget:** `https://islam.house/embed/prayer_times?city=london` (iframe for mosque sites; backlink to islam.house).
2. **Wikidata:** create entity name `islam.house`, official website `https://islam.house`.
3. **YouTube:** playlist; each video description links canonical surah/hadith URL.
4. **Directories once:** Product Hunt, AlternativeTo (vs Muslim Pro), PWA directories.
5. **Communities playbook:** answer 1–2 high-quality threads when shipping a feature (r/islam, ID/UR/FR forums). No spam.

## Core Web Vitals gate

After enabling `SEO_RICH_HTML`, re-check PageSpeed on `/` and `/quran/36` (mobile). If LCP/INP/CLS regress vs baseline, set `SEO_RICH_HTML=0` and investigate.

## Ramadan 2027

City pages: `/ramadan/2027/{city}`. Keep indexed before December 2026.

## Activation / retention (on-site)

- Home install CTA (PWA)
- Share cards (`/share`)
- Prayer notifications (consent-gated)
- Continue reading on home

## Phase 9 (only if weekly report trips)

1. API HMAC session cookie for `/api/*` if scraping continues past edge limits.
2. Cloudflare Pro if Free bot tools are exhausted after ~30 days of clean rules.
