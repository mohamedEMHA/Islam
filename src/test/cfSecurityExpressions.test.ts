import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  AI_RULE_REF,
  EXPR_MAX_LEN,
  assertSafeExpression,
  buildAiTrainingExpression,
  buildBadClientsExpression,
  buildDatacenterExpression,
  buildOwnedRules,
  buildRateLimitExpression,
  buildStaleBrowserExpression,
  mergeCustomRules,
} from '../../scripts/cf_security_expressions.mjs'

const config = JSON.parse(
  readFileSync(join(process.cwd(), 'security/cloudflare_security.json'), 'utf8'),
)

describe('cf_security_expressions', () => {
  it('rejects matches() and overlong expressions', () => {
    expect(() => assertSafeExpression('http.user_agent matches "x"')).toThrow(/matches/)
    expect(() => assertSafeExpression('a'.repeat(EXPR_MAX_LEN + 1))).toThrow(/exceeds/)
  })

  it('builds AI training expression with robots.txt exclusion for all agents', () => {
    const expr = buildAiTrainingExpression(config.aiCrawlControl.blockTraining)
    expect(expr.startsWith('(http.request.uri.path ne "/robots.txt") and (')).toBe(true)
    expect(expr).toContain('GPTBot')
    expect(expr).not.toContain('Claude-User')
    expect(expr.length).toBeLessThanOrEqual(EXPR_MAX_LEN)
  })

  it('builds bad clients, datacenter, stale, and rate limit expressions under Free limits', () => {
    const bad = buildBadClientsExpression(config)
    const dc = buildDatacenterExpression(config)
    const stale = buildStaleBrowserExpression(config)
    const rl = buildRateLimitExpression(config.rateLimit)
    for (const expr of [bad, dc, stale, rl]) {
      expect(expr).toContain('not cf.client.bot')
      expect(expr).not.toMatch(/\bmatches\b/)
      expect(expr.length).toBeLessThanOrEqual(EXPR_MAX_LEN)
    }
    expect(stale).toContain(`Chrome/${config.staleChromeMin}.`)
    expect(stale).toContain(
      `Chrome/${config.chromeStable - config.staleChromeLookback}.`,
    )
    expect(stale).not.toContain(`Chrome/${config.chromeStable - config.staleChromeLookback + 1}.`)
  })

  it('merges AI Crawl Control rule ahead of owned rules', () => {
    const owned = buildOwnedRules(config)
    const merged = mergeCustomRules(
      [{ ref: AI_RULE_REF, action: 'block', description: 'AI', expression: 'true', enabled: true }],
      owned,
    )
    expect(merged[0].ref).toBe(AI_RULE_REF)
    expect(merged.slice(1).map((r) => r.ref)).toEqual(owned.map((r) => r.ref))
  })
})
