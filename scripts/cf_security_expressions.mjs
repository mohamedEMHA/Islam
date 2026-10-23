/** Pure expression builders for islam.house Cloudflare custom rules. */

export const EXPR_MAX_LEN = 4096
export const AI_RULE_REF = '[CF AI Audit]'
export const OWNED_REFS = [
  'islam_house_block_bad_clients',
  'islam_house_challenge_datacenter',
  'islam_house_challenge_stale_browsers',
]

export function assertSafeExpression(expression, label = 'expression') {
  if (typeof expression !== 'string' || !expression) {
    throw new Error(`${label}: empty`)
  }
  if (expression.length > EXPR_MAX_LEN) {
    throw new Error(`${label}: length ${expression.length} exceeds ${EXPR_MAX_LEN}`)
  }
  if (/\bmatches\b/.test(expression)) {
    throw new Error(`${label}: Free plan does not support matches()`)
  }
  return expression
}

export function buildAiTrainingExpression(blockTraining) {
  const parts = blockTraining.map((u) => `(http.user_agent contains "${u}")`).join(' or ')
  return assertSafeExpression(
    `(http.request.uri.path ne "/robots.txt") and (${parts})`,
    'ai',
  )
}

export function buildBadClientsExpression({ scannerPaths, toolUserAgents }) {
  const paths = scannerPaths.map((p) => `http.request.uri.path contains "${p}"`).join(' or ')
  const tools = toolUserAgents.map((u) => `http.user_agent contains "${u}"`).join(' or ')
  // Allow SEO discovery paths even with empty/tool UA (GSC sitemap fetch is often not cf.client.bot).
  return assertSafeExpression(
    `(not cf.client.bot)` +
      ` and (not starts_with(http.request.uri.path, "/.well-known/"))` +
      ` and (http.request.uri.path ne "/robots.txt")` +
      ` and (http.request.uri.path ne "/llms.txt")` +
      ` and (http.request.uri.path ne "/llms-full.txt")` +
      ` and (not starts_with(http.request.uri.path, "/sitemap"))` +
      ` and (` +
      `(${paths})` +
      ` or (http.user_agent eq "")` +
      ` or (${tools})` +
      ` or ((http.request.method ne "GET") and (http.request.method ne "HEAD") and (http.request.method ne "OPTIONS")` +
      ` and (not ((http.request.method eq "POST") and (http.request.uri.path eq "/api/ummah/zakat/calculate"))))` +
      `)`,
    'bad_clients',
  )
}

export function buildDatacenterExpression({ datacenterAsns, previewBotAllowlist }) {
  const asns = datacenterAsns.join(' ')
  const preview = previewBotAllowlist
    .map((u) => `and (not (http.user_agent contains "${u}"))`)
    .join(' ')
  return assertSafeExpression(
    `(not cf.client.bot)` +
      ` and (not starts_with(http.request.uri.path, "/.well-known/"))` +
      ` and (http.request.uri.path ne "/robots.txt")` +
      ` and (http.request.uri.path ne "/llms.txt")` +
      ` and (not starts_with(http.request.uri.path, "/sitemap"))` +
      ` ${preview}` +
      ` and ((ip.src.asnum in {${asns}}) or (ip.src.country eq "T1"))`,
    'datacenter',
  )
}

export function buildStaleBrowserExpression({
  chromeStable,
  staleChromeLookback,
  staleChromeMin,
}) {
  const maxStale = chromeStable - staleChromeLookback
  const parts = []
  for (let v = staleChromeMin; v <= maxStale; v += 1) {
    parts.push(`(http.user_agent contains "Chrome/${v}.")`)
  }
  return assertSafeExpression(
    `(not cf.client.bot) and (${parts.join(' or ')} or (http.user_agent contains "MSIE") or (http.user_agent contains "Trident/"))`,
    'stale_browsers',
  )
}

export function buildRateLimitExpression({ excludePathPrefixes }) {
  const excludes = excludePathPrefixes
    .map((p) => `and (not starts_with(http.request.uri.path, "${p}"))`)
    .join(' ')
  return assertSafeExpression(`(not cf.client.bot) ${excludes}`.replace(/\s+/g, ' ').trim(), 'rate_limit')
}

export function buildOwnedRules(config) {
  return [
    {
      action: 'block',
      description: 'Block bad clients (scanners, empty/tool UA, bad methods)',
      enabled: true,
      expression: buildBadClientsExpression(config),
      ref: 'islam_house_block_bad_clients',
    },
    {
      action: 'managed_challenge',
      description: 'Challenge datacenter ASN and Tor (not verified bots)',
      enabled: true,
      expression: buildDatacenterExpression(config),
      ref: 'islam_house_challenge_datacenter',
    },
    {
      action: 'managed_challenge',
      description: 'Challenge stale browsers (Chrome 100 to stable-12, IE)',
      enabled: true,
      expression: buildStaleBrowserExpression(config),
      ref: 'islam_house_challenge_stale_browsers',
    },
  ]
}

/** Merge AI Crawl Control rule (preserved) with owned rules. */
export function mergeCustomRules(liveRules, ownedRules) {
  const ai = (liveRules || []).find((r) => r.ref === AI_RULE_REF)
  const next = []
  if (ai) {
    next.push({
      action: ai.action,
      description: ai.description,
      enabled: ai.enabled !== false,
      expression: ai.expression,
      ref: AI_RULE_REF,
    })
  }
  for (const rule of ownedRules) next.push(rule)
  return next
}
