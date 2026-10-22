# Real users (Phase 8)

Measure humans with **Web Analytics (RUM)** only. Zone "Visitors" includes bots.

## Search

1. Google Search Console: property already has TXT verification. Submit `https://islam.house/sitemap.xml`. Watch coverage after 404 hardening.
2. Bing Webmaster Tools: import from GSC or verify, submit the same sitemap.
3. Confirm hreflang alternates in GSC International Targeting (or equivalent report).

## AI search visibility

Allowed: OAI-SearchBot, ChatGPT-User, Perplexity*, Claude-SearchBot, Claude-User, Applebot, DuckAssistBot.

Blocked at edge + robots: GPTBot, ClaudeBot, CCBot, Bytespider, and other training scrapers.

`https://islam.house/llms.txt` describes the site for AI answer engines.

## Ramadan 2027 (early February)

Ship by December so crawlers can index:

- Ramadan landing (hours, share cards, PWA install CTA)
- Share cards as viral loop
- Community: r/islam, mosque WhatsApp groups

## Phase 9 (only if weekly report trips)

1. API HMAC session cookie for `/api/*` if scraping continues past edge limits.
2. Cloudflare Pro if Free bot tools are exhausted after ~30 days of clean rules.
