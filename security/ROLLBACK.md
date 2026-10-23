# SEO / Worker rollback (&lt;5 minutes)

## When to roll back

- Spike in 5xx after deploy
- Blank or double content on `/`, `/quran/1`, `/prayer_times`
- Googlebot / Bingbot get blocked or empty title
- Core Web Vitals regress after `SEO_RICH_HTML=1`

## Fast path (no code change)

1. Cloudflare Dashboard → Workers → `islam` → Settings → Variables
2. Set `SEO_RICH_HTML` = `0` and/or `SEO_CITY_PAGES` = `0`
3. Save → thin SEO HTML for crawlers; city pages stay 200 but become **noindex** and `sitemap_cities.xml` returns 404 (routes are not removed)

## Worker version rollback

```bash
npx wrangler deployments list
npx wrangler rollback
```

Confirm with:

```bash
curl -sA "Googlebot" -H "Accept: text/html" https://islam.house/ | findstr /i title
curl -sA "Googlebot" -H "Accept: text/html" https://islam.house/quran/1 | findstr /i title
curl -sA "Mozilla" -H "Accept: text/html" https://islam.house/prayer_times | findstr /i title
```

## Preview before production

```bash
npm run build
npx wrangler versions upload
# smoke the version URL, then:
npx wrangler versions deploy
```

## Smoke checklist (5 URLs)

1. `https://islam.house/`
2. `https://islam.house/quran/1`
3. `https://islam.house/ar/quran/1`
4. `https://islam.house/fr/quran/1`
5. `https://islam.house/prayer_times`

Each must return 200, a unique `<title>`, and hydrate into the React app for normal browsers.
