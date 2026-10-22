# Account hardening (manual, once)

## Cloudflare

- [ ] Enable 2FA with a hardware security key on the account owner
- [ ] Review Members; remove unused access
- [ ] Delete unused API tokens; keep only scoped tokens
- [ ] Create API token (OAuth cannot do this; needs dashboard once):
  1. Open https://dash.cloudflare.com/profile/api-tokens → Create Token → Custom token
  2. Name: `islam.house security sync`
  3. Permissions: Zone → Zone → Read; Zone → WAF → Edit; Zone → Zone Settings → Edit; Account → Account Analytics → Read
  4. Zone Resources: Include → Specific zone → `islam.house`
  5. Create, copy the value once
  6. In PowerShell (repo root): `gh secret set CLOUDFLARE_SECURITY_TOKEN -R mohamedEMHA/Islam` then paste the token when prompted
- [x] GitHub variable `CLOUDFLARE_ACCOUNT_ID` = `b227e023e64516d914434b6a571e7133` (set)
- [ ] Optional: also set secret `CLOUDFLARE_ACCOUNT_ID` if the workflow should read it as a secret instead of a variable
- [ ] Skim Audit Log after this rollout

## GitHub (`mohamedEMHA/Islam` or current remote)

- [ ] 2FA on the owner account
- [ ] Secret scanning + push protection ON
- [ ] Dependabot alerts ON (config: `.github/dependabot.yml`)
- [ ] Branch protection on `main`: require `ci_checks` status check
- [ ] Confirm `SUNNAH_API_KEY` exists only as `wrangler secret`, never in git
- [ ] Optional: run `gitleaks detect` once against history

## After 14 days

- [ ] Escalate DMARC TXT `_dmarc` from `p=none` to `p=reject` (Email Routing only; no outbound mail)
