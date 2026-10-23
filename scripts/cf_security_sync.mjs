#!/usr/bin/env node
/**
 * Sync islam.house Cloudflare security desired state.
 * Modes: --check | --apply | --report | --refresh-chrome
 *
 * Env: CLOUDFLARE_API_TOKEN (or CLOUDFLARE_SECURITY_TOKEN), optional CLOUDFLARE_ACCOUNT_ID
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AI_RULE_REF,
  buildAiTrainingExpression,
  buildOwnedRules,
  buildRateLimitExpression,
  mergeCustomRules,
} from './cf_security_expressions.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CONFIG_PATH = join(ROOT, 'security', 'cloudflare_security.json')

function parseArgs(argv) {
  const modes = ['check', 'apply', 'report', 'refresh-chrome']
  const mode = modes.find((m) => argv.includes(`--${m}`)) || 'check'
  return { mode }
}

async function loadConfig() {
  return JSON.parse(await readFile(CONFIG_PATH, 'utf8'))
}

function token() {
  const t = process.env.CLOUDFLARE_SECURITY_TOKEN || process.env.CLOUDFLARE_API_TOKEN
  if (!t) throw new Error('Set CLOUDFLARE_SECURITY_TOKEN or CLOUDFLARE_API_TOKEN')
  return t
}

async function cf(method, path, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!json.success) {
    const err = (json.errors || []).map((e) => e.message).join('; ') || res.statusText
    throw new Error(`${method} ${path}: ${err}`)
  }
  return json.result
}

async function fetchChromeStable() {
  const res = await fetch(
    'https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Windows&num=1&offset=0',
  )
  if (!res.ok) throw new Error(`chromiumdash HTTP ${res.status}`)
  const data = await res.json()
  const milestone = Number(data?.[0]?.milestone)
  if (!Number.isFinite(milestone)) throw new Error('could not parse chrome milestone')
  return milestone
}

async function refreshChrome(config) {
  const stable = await fetchChromeStable()
  if (stable === config.chromeStable) {
    console.log(`chromeStable unchanged: ${stable}`)
    return config
  }
  const next = { ...config, chromeStable: stable }
  await writeFile(CONFIG_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  console.log(`chromeStable updated: ${config.chromeStable} -> ${stable}`)
  return next
}

function normalizeRule(r) {
  return {
    action: r.action,
    description: r.description,
    enabled: r.enabled !== false,
    expression: r.expression,
    ref: r.ref,
  }
}

function rulesEqual(a, b) {
  return JSON.stringify(a.map(normalizeRule)) === JSON.stringify(b.map(normalizeRule))
}

async function getCustomEntrypoint(zoneId) {
  return cf('GET', `/zones/${zoneId}/rulesets/phases/http_request_firewall_custom/entrypoint`)
}

async function putCustomEntrypoint(zoneId, rules) {
  return cf('PUT', `/zones/${zoneId}/rulesets/phases/http_request_firewall_custom/entrypoint`, {
    rules,
  })
}

async function syncAiExpression(liveRules, config) {
  const ai = (liveRules || []).find((r) => r.ref === AI_RULE_REF)
  if (!ai) return liveRules
  const desired = buildAiTrainingExpression(config.aiCrawlControl.blockTraining)
  if (ai.expression === desired) return liveRules
  return (liveRules || []).map((r) =>
    r.ref === AI_RULE_REF
      ? {
          ...r,
          description: 'AI Crawl Control - Block AI training bots by User Agent',
          expression: desired,
        }
      : r,
  )
}

async function ensureRateLimit(zoneId, config) {
  const expression = buildRateLimitExpression(config.rateLimit)
  const rule = {
    action: 'block',
    description: 'Rate limit non-static traffic 50/10s per IP',
    enabled: true,
    expression,
    ref: 'islam_house_rate_limit',
    ratelimit: {
      characteristics: ['ip.src', 'cf.colo.id'],
      period: config.rateLimit.period,
      requests_per_period: config.rateLimit.requestsPerPeriod,
      mitigation_timeout: config.rateLimit.mitigationTimeout,
    },
  }
  try {
    const entry = await cf('GET', `/zones/${zoneId}/rulesets/phases/http_ratelimit/entrypoint`)
    const live = entry.rules?.[0]
    if (
      live &&
      live.expression === expression &&
      live.ratelimit?.requests_per_period === config.rateLimit.requestsPerPeriod
    ) {
      return { ok: true, changed: false, id: entry.id }
    }
    await cf('PUT', `/zones/${zoneId}/rulesets/phases/http_ratelimit/entrypoint`, {
      rules: [rule],
    })
    return { ok: true, changed: true, id: entry.id }
  } catch (e) {
    if (!String(e.message).includes('could not find entrypoint')) throw e
    const created = await cf('POST', `/zones/${zoneId}/rulesets`, {
      name: 'islam.house rate limiting',
      kind: 'zone',
      phase: 'http_ratelimit',
      rules: [rule],
    })
    return { ok: true, changed: true, id: created.id }
  }
}

async function ensureBotManagement(zoneId, config) {
  const desired = config.botManagement
  if (!desired || typeof desired.fight_mode !== 'boolean') return { skipped: true }
  const live = await cf('GET', `/zones/${zoneId}/bot_management`)
  if (live.fight_mode === desired.fight_mode) {
    return { fight_mode: 'ok', value: live.fight_mode }
  }
  await cf('PUT', `/zones/${zoneId}/bot_management`, {
    fight_mode: desired.fight_mode,
    enable_js: live.enable_js ?? true,
    ai_training: live.ai_training ?? 'block',
    ai_bots_protection: live.ai_bots_protection ?? 'disabled',
    content_bots_protection: live.content_bots_protection ?? 'disabled',
    crawler_protection: live.crawler_protection ?? 'disabled',
    is_robots_txt_managed: live.is_robots_txt_managed ?? false,
  })
  return { fight_mode: 'updated', value: desired.fight_mode }
}

async function ensureSettings(zoneId, config) {
  const results = {}
  for (const [id, value] of Object.entries(config.zoneSettings || {})) {
    const live = await cf('GET', `/zones/${zoneId}/settings/${id}`)
    if (live.value === value) {
      results[id] = 'ok'
      continue
    }
    await cf('PATCH', `/zones/${zoneId}/settings/${id}`, { value })
    results[id] = 'updated'
  }
  if (config.flags?.crawlhints_enabled) {
    try {
      await cf('POST', `/zones/${zoneId}/flags/products/cache/changes`, {
        feature: 'crawlhints_enabled',
        value: true,
      })
      results.crawlhints = 'applied'
    } catch (e) {
      results.crawlhints = `skip: ${String(e.message).slice(0, 80)}`
    }
  }
  return results
}

async function runCheck(config) {
  const entry = await getCustomEntrypoint(config.zoneId)
  const withAi = await syncAiExpression(entry.rules || [], config)
  const desired = mergeCustomRules(withAi, buildOwnedRules(config))
  const liveOwned = (entry.rules || [])
    .filter((r) => r.ref === AI_RULE_REF || (r.ref || '').startsWith('islam_house_'))
    .map(normalizeRule)
  const desiredNorm = desired.map(normalizeRule)
  const ok = rulesEqual(liveOwned, desiredNorm)
  console.log(ok ? 'OK: custom rules match desired state' : 'DRIFT: custom rules differ')
  if (!ok) {
    console.log(
      JSON.stringify(
        { live: liveOwned.map((r) => r.ref), desired: desiredNorm.map((r) => r.ref) },
        null,
        2,
      ),
    )
  }
  return ok ? 0 : 1
}

async function runApply(config) {
  const entry = await getCustomEntrypoint(config.zoneId)
  const withAi = await syncAiExpression(entry.rules || [], config)
  const desired = mergeCustomRules(withAi, buildOwnedRules(config))
  await putCustomEntrypoint(config.zoneId, desired)
  const rl = await ensureRateLimit(config.zoneId, config)
  const settings = await ensureSettings(config.zoneId, config)
  const botManagement = await ensureBotManagement(config.zoneId, config)
  const verify = await getCustomEntrypoint(config.zoneId)
  console.log(
    JSON.stringify(
      {
        applied: true,
        rules: (verify.rules || []).map((r) => ({ ref: r.ref, action: r.action })),
        rateLimit: rl,
        settings,
        botManagement,
      },
      null,
      2,
    ),
  )
  return 0
}

async function gql(query) {
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '))
  }
  return json.data
}

async function runReport(config) {
  const since = new Date(Date.now() - 7 * 86400000).toISOString()
  const until = new Date().toISOString()
  const sinceDate = since.slice(0, 10)
  const tag = config.zoneId
  const accountId = config.accountId || process.env.CLOUDFLARE_ACCOUNT_ID

  const httpQ = `query {
    viewer {
      zones(filter: {zoneTag: "${tag}"}) {
        totals: httpRequestsAdaptiveGroups(
          limit: 1
          filter: {datetime_geq: "${since}", datetime_leq: "${until}", requestSource: "eyeball"}
        ) { count sum { visits } }
        byAction: httpRequestsAdaptiveGroups(
          limit: 10
          filter: {datetime_geq: "${since}", datetime_leq: "${until}", requestSource: "eyeball"}
          orderBy: [count_DESC]
        ) { count dimensions { securityAction } }
        byStatus: httpRequestsAdaptiveGroups(
          limit: 15
          filter: {datetime_geq: "${since}", datetime_leq: "${until}", requestSource: "eyeball"}
          orderBy: [count_DESC]
        ) { count dimensions { edgeResponseStatus } }
        topUa: httpRequestsAdaptiveGroups(
          limit: 8
          filter: {datetime_geq: "${since}", datetime_leq: "${until}", requestSource: "eyeball", AND:[{securityAction_notin: ["block","managed_challenge","jschallenge","challenge"]}]}
          orderBy: [count_DESC]
        ) { count dimensions { userAgent } }
        topPath: httpRequestsAdaptiveGroups(
          limit: 8
          filter: {datetime_geq: "${since}", datetime_leq: "${until}", requestSource: "eyeball", AND:[{securityAction_notin: ["block","managed_challenge","jschallenge","challenge"]}]}
          orderBy: [count_DESC]
        ) { count dimensions { clientRequestPath } }
      }
    }
  }`

  let zone = null
  try {
    const data = await gql(httpQ)
    zone = data?.viewer?.zones?.[0] || null
  } catch (e) {
    console.warn(`GraphQL zone report limited: ${e.message}`)
  }

  let workerMaxDay = 0
  if (accountId) {
    try {
      const wq = `query {
        viewer {
          accounts(filter: {accountTag: "${accountId}"}) {
            workersInvocationsAdaptive(
              limit: 14
              filter: {date_geq: "${sinceDate}", scriptName: "islam"}
              orderBy: [date_ASC]
            ) { sum { requests errors } dimensions { date } }
          }
        }
      }`
      const wd = await gql(wq)
      const rows = wd?.viewer?.accounts?.[0]?.workersInvocationsAdaptive || []
      for (const row of rows) {
        workerMaxDay = Math.max(workerMaxDay, row.sum?.requests || 0)
      }
    } catch (e) {
      console.warn(`Worker report limited: ${e.message}`)
    }
  }

  const totals = zone?.totals?.[0]?.count || 0
  const byAction = Object.fromEntries(
    (zone?.byAction || []).map((r) => [r.dimensions.securityAction || 'unknown', r.count]),
  )
  const blocked = byAction.block || 0
  const challenged =
    (byAction.managed_challenge || 0) + (byAction.challenge || 0) + (byAction.jschallenge || 0)
  const unmitigated = byAction.unknown || 0
  const byStatus = Object.fromEntries(
    (zone?.byStatus || []).map((r) => [String(r.dimensions.edgeResponseStatus), r.count]),
  )
  const status5xx = Object.entries(byStatus)
    .filter(([s]) => s.startsWith('5'))
    .reduce((a, [, c]) => a + c, 0)
  const status429 = byStatus['429'] || 0
  const rate5xx = totals ? status5xx / totals : 0
  const rate429 = totals ? status429 / totals : 0

  const thresholds = config.reportThresholds
  const anomalies = []
  if (workerMaxDay > thresholds.workerRequestsPerDay) {
    anomalies.push(`worker_peak=${workerMaxDay} > ${thresholds.workerRequestsPerDay}`)
  }
  if (rate5xx > thresholds.error5xxRate) {
    anomalies.push(`5xx_rate=${rate5xx.toFixed(4)} > ${thresholds.error5xxRate}`)
  }
  if (rate429 > thresholds.rateLimit429Rate) {
    anomalies.push(`429_rate=${rate429.toFixed(4)} > ${thresholds.rateLimit429Rate}`)
  }
  // RUM visits not always available via GraphQL on Free; use unmitigated vs total as proxy
  if (totals > 0 && unmitigated / Math.max(totals - blocked - challenged, 1) > 0.95) {
    // informational only when nearly everything is unmitigated (rules not firing)
  }

  const report = {
    window: { since, until },
    totals,
    blocked,
    challenged,
    unmitigated,
    workerMaxDay,
    rate5xx,
    rate429,
    topUa: (zone?.topUa || []).map((r) => ({
      count: r.count,
      ua: (r.dimensions.userAgent || '').slice(0, 120),
    })),
    topPath: (zone?.topPath || []).map((r) => ({
      count: r.count,
      path: r.dimensions.clientRequestPath,
    })),
    anomalies,
  }

  console.log(JSON.stringify(report, null, 2))
  if (anomalies.length) {
    console.log(`::warning::Security anomalies: ${anomalies.join('; ')}`)
    // GitHub Actions: write marker for issue step
    if (process.env.GITHUB_OUTPUT) {
      await writeFile(
        process.env.GITHUB_OUTPUT,
        `anomalies=${anomalies.join(' | ')}\nhas_anomalies=true\n`,
        { flag: 'a' },
      )
    }
    return 2
  }
  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, 'has_anomalies=false\n', { flag: 'a' })
  }
  return 0
}

async function main() {
  const { mode } = parseArgs(process.argv.slice(2))
  let config = await loadConfig()
  if (mode === 'refresh-chrome') {
    config = await refreshChrome(config)
    process.exit(0)
  }
  if (mode === 'check') process.exit(await runCheck(config))
  if (mode === 'apply') process.exit(await runApply(config))
  if (mode === 'report') process.exit(await runReport(config))
  throw new Error(`unknown mode ${mode}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
