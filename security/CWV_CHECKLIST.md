# Core Web Vitals gate (after SEO HTML changes)

1. Open https://pagespeed.web.dev/
2. Test `https://islam.house/` and `https://islam.house/quran/36` (Mobile).
3. Record LCP, INP, CLS vs previous baseline (Phase 0).
4. If any metric regresses materially after `SEO_RICH_HTML=1`:
   - Set Worker var `SEO_RICH_HTML=0`
   - Confirm browser HTML still uses clipped stub (`clip:rect`)
   - Re-test, then fix root cause before re-enabling

Rich HTML is **crawler-only** when the flag is on, so normal browsers should not see heavier first paint from SEO body.
