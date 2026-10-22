# Islam

A responsive Islamic web app built with Vite, React, TypeScript, and Tailwind CSS. Accurate prayer times, Quran, hadith, duas, and daily tools with full source attribution.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Architecture

### Stack
- **Vite 7** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **React Router 7** for client-side routing
- **Zustand** for settings and favorites (persisted to localStorage)
- **react-i18next** (en, ar, ur, id, fr)
- **vite-plugin-pwa** for installable SPA + PWA with prayer times and Quran CDN caching
- **Cloudflare Worker** proxies allowlisted `/api/*` routes and serves the SPA from `dist/`

### Layout shells

| Layout | Routes | Chrome |
|---|---|---|
| `RootLayout` | wraps all routes | Cookie consent + shared error boundary |
| `MarketingLayout` | `/`, `/get_app`, `/sources`, `/privacy`, `/terms` | Top nav with mega menu + footer |
| `AppLayout` | All feature pages | Grouped accordion sidebar + mobile bottom nav |
| `OnboardingLayout` | `/welcome`, `/onboarding` | Fullscreen, no chrome |

### Folder structure

```
src/
  app/          routing, providers
  components/   shared UI, nav, prayer widgets
  features/     one folder per feature page
  layouts/      RootLayout, MarketingLayout, AppLayout, OnboardingLayout
  lib/          api clients, hooks, stores, utils, navConfig
  styles/       Tailwind globals + design tokens
  types/        shared TypeScript types
  i18n/         translation files
worker/         Cloudflare Worker API proxy (allowlisted paths)
```

### Data sources (all attributed in UI)
| Feature | API |
|---|---|
| Prayer Times, Hijri, 99 Names | [AlAdhan API](https://aladhan.com/prayer-times-api) |
| Quran text & audio | [Quran.com API](https://quran.com) / [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) |
| Hadith | sunnah.com via Worker `/api/sunnah` (fallback: islamic.app / fawazahmed0) |
| Duas | Local data + UmmahAPI daily feed |
| Qibla | Great Circle formula (local math) |
| Zakat | [UmmahAPI](https://ummahapi.com) calculation; [XAUS.com](https://xaus.com/api) metal price cross check |

### Design notes
1. Mega menu and grouped accordion sidebar are the primary nav patterns
2. Epilogue + Inter typography
3. Logo uses local `public/logo.svg` / `public/logo.png`
4. Next Prayer widget is wired to live AlAdhan data

### TODO (product)
- Auth / cross device sync
- Community error report inbox
- Dedicated maskable PWA icons (192/512) separate from logo.png
- Service Worker / Push based adhan delivery while the tab is closed

### Environment variables (local / Worker)

Server-side API keys are **not** exposed in the Vite client bundle. Never use the `VITE_` prefix for secrets.

Local (`.env.local` / `.dev.vars`):

```bash
SUNNAH_API_KEY=
UMMAH_API_KEY=
VITE_SITE_URL=https://islam.house
VITE_CF_ANALYTICS_TOKEN=
```

Production Worker secrets:

```bash
npx wrangler secret put SUNNAH_API_KEY
npx wrangler secret put UMMAH_API_KEY
```

The Worker allowlists proxy paths under `/api/sunnah`, `/api/ummah`, and `/api/aloula`, rate-limits by IP, and serves the SPA from `dist/` (see `wrangler.jsonc` and `public/_headers` for CSP).

## Scripts

```bash
npm run dev
npm run build
npm run test
npm run lint
npm run merge_locales   # sync locale key trees
npm run gen_e_numbers   # regenerate e_numbers.json helpers
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Cloudflare)

```bash
npm run build
npx wrangler deploy
```

Set secrets on the target Worker before deploy if you use Sunnah or UmmahAPI proxy routes. Point your custom domain to the Cloudflare Workers project as usual for a static SPA with client-side routing.

### Windows: dev server blocked by Application Control

If `npm run dev` fails with `Application Control policy has blocked` on `rollup.win32-x64-msvc.node`, this is **not** a OneDrive issue. Windows Code Integrity blocks unsigned native Node binaries.

This project uses an npm override to force Rollup's WASM build instead:

```json
"overrides": {
  "rollup": "npm:@rollup/wasm-node"
}
```

After changing overrides, run a clean install:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

Dev server: http://localhost:5173/
