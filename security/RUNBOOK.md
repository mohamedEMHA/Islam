# islam.house security runbook

## When something spikes

1. Open [Security Events](https://dash.cloudflare.com/?to=/:account/islam.house/security/events) for the last 24h.
2. Group by ASN, User Agent, Path, Country. Find the common attribute.
3. Use **custom rule slot 5** (kept empty on purpose): managed challenge first, never hard block until confirmed.
4. If the attack is live and origin/Worker is drowning: Security Level → **I'm Under Attack** for the duration only, then OFF.
5. After 7 days of clean signals, promote lasting filters into `security/cloudflare_security.json` and clear rule 5.
6. Rollback: restore rules from `security/backup_2026_10_22_pre_phase1.json` or re-run `node scripts/cf_security_sync.mjs --apply` from a known-good commit.

## Weekly automation

`.github/workflows/cf_security.yml` every Monday:

- refreshes Chrome stable milestone for the stale-browser rule
- applies desired state from `security/cloudflare_security.json`
- posts a GraphQL report; opens a GitHub issue if thresholds trip

## Thresholds (see config)

| Signal | Threshold |
| --- | --- |
| Worker requests / day | 50_000 |
| 5xx rate | 1% |
| 429 rate | 2% |

## Manual checks (false positive matrix)

Must block: empty UA, `curl`, `/wp-login.php`, `/.env`, `PUT /`.

Must pass without challenge: current Chrome/Safari/Firefox, mobile data, installed PWA, Google/Bing URL Inspection, PageSpeed Insights.

Previews must work: WhatsApp, Telegram, Facebook, X, LinkedIn, Discord.

Challenge OK (solvable once): VPN (e.g. M247), Tor Browser.

## Token

GitHub secret `CLOUDFLARE_SECURITY_TOKEN` scoped to zone `islam.house`:

- Zone Read
- Zone WAF Edit
- Zone Settings Edit
- Account Analytics Read (for Worker report; optional `CLOUDFLARE_ACCOUNT_ID`)

## DNS notes

- Nameservers are Cloudflare (`anuj` / `paige`). DNSSEC DS is managed by Cloudflare (status may show `pending` briefly after enable).
- DMARC starts at `p=none`. After 14 days of clean reports, escalate TXT to `p=reject`.
