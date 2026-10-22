export const EXPR_MAX_LEN: number
export const AI_RULE_REF: string
export const OWNED_REFS: string[]

export function assertSafeExpression(expression: string, label?: string): string
export function buildAiTrainingExpression(blockTraining: string[]): string
export function buildBadClientsExpression(config: {
  scannerPaths: string[]
  toolUserAgents: string[]
}): string
export function buildDatacenterExpression(config: {
  datacenterAsns: number[]
  previewBotAllowlist: string[]
}): string
export function buildStaleBrowserExpression(config: {
  chromeStable: number
  staleChromeLookback: number
  staleChromeMin: number
}): string
export function buildRateLimitExpression(config: {
  excludePathPrefixes: string[]
}): string

export interface OwnedRule {
  action: string
  description: string
  enabled: boolean
  expression: string
  ref: string
}

export function buildOwnedRules(config: {
  scannerPaths: string[]
  toolUserAgents: string[]
  datacenterAsns: number[]
  previewBotAllowlist: string[]
  chromeStable: number
  staleChromeLookback: number
  staleChromeMin: number
}): OwnedRule[]

export function mergeCustomRules(
  liveRules: Array<{ ref?: string; action: string; description: string; expression: string; enabled?: boolean }>,
  ownedRules: OwnedRule[],
): OwnedRule[]
