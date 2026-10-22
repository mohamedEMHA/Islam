/** Sunni faraid estimate for common heirs: spouse, parents, sons, daughters. */

export type DecedentSex = 'male' | 'female'

export interface InheritanceInput {
  estateValue: number
  decedentSex: DecedentSex
  /** Only when decedent is female. At most one husband. */
  husbandAlive: boolean
  /** Only when decedent is male. Capped at 4. */
  wives: number
  sons: number
  daughters: number
  father: boolean
  mother: boolean
}

export type HeirKind =
  | 'husband'
  | 'wife'
  | 'father'
  | 'mother'
  | 'son'
  | 'daughter'
  | 'residue'

export interface InheritanceShare {
  heir: HeirKind
  /** Stable key for React lists when multiple people share an heir kind. */
  id: string
  fraction: string
  amount: number
  /** Portion of the estate in [0, 1]. */
  portion: number
}

export type InheritanceNoteKey = 'empty' | 'base' | 'awl' | 'radd'

export interface InheritanceResult {
  shares: InheritanceShare[]
  /** i18n note keys under pages.inheritance.notes.* */
  noteKeys: InheritanceNoteKey[]
  appliedAwl: boolean
  appliedRadd: boolean
}

interface MutableShare {
  heir: HeirKind
  id: string
  fraction: string
  portion: number
  /** Participates in radd (blood heirs with fixed shares). */
  raddEligible: boolean
  /** Asaba / residual taker (not scaled by awl the same way as fixed). */
  isAsaba: boolean
}

function clampNonNegInt(value: number, max?: number): number {
  const n = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0))
  return max === undefined ? n : Math.min(n, max)
}

function formatPortion(portion: number): string {
  const denoms = [2, 3, 4, 6, 8, 12, 24]
  for (const d of denoms) {
    const num = Math.round(portion * d)
    if (Math.abs(portion - num / d) < 1e-9 && num > 0) {
      const g = gcd(num, d)
      return `${num / g}/${d / g}`
    }
  }
  const pct = portion * 100
  if (Math.abs(pct - Math.round(pct)) < 1e-6) return `${Math.round(pct)}%`
  return `${pct.toFixed(2)}%`
}

function estatePortionAmount(estate: number, portion: number): number {
  return Math.round(estate * 100 * portion) / 100
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

/**
 * Educational Sunni faraid calculator.
 *
 * Supports: one spouse side (husband OR wives), father, mother, sons, daughters.
 * Includes umariyyatayn (mother takes 1/3 of residue after spouse when no children),
 * daughter fixed shares, father as asaba with daughters-only, awl, and radd
 * (surplus to blood fixed-share heirs, not the spouse).
 */
export function calculateInheritanceShares(input: InheritanceInput): InheritanceResult {
  const estate = Math.max(0, Number.isFinite(input.estateValue) ? input.estateValue : 0)
  const sons = clampNonNegInt(input.sons)
  const daughters = clampNonNegInt(input.daughters)
  const wives =
    input.decedentSex === 'male' ? clampNonNegInt(input.wives, 4) : 0
  const husbandAlive = input.decedentSex === 'female' && input.husbandAlive
  const hasChildren = sons > 0 || daughters > 0
  const hasSon = sons > 0
  const father = input.father
  const mother = input.mother

  const shares: MutableShare[] = []
  let fixedTotal = 0

  const pushFixed = (
    heir: HeirKind,
    id: string,
    portion: number,
    fraction: string,
    raddEligible: boolean,
  ) => {
    if (portion <= 0) return
    shares.push({
      heir,
      id,
      fraction,
      portion,
      raddEligible,
      isAsaba: false,
    })
    fixedTotal += portion
  }

  // Spouse fixed shares (Quran 4:12)
  if (husbandAlive) {
    const portion = hasChildren ? 1 / 4 : 1 / 2
    pushFixed('husband', 'husband', portion, formatPortion(portion), false)
  } else if (wives > 0) {
    const pool = hasChildren ? 1 / 8 : 1 / 4
    const each = pool / wives
    for (let i = 0; i < wives; i += 1) {
      pushFixed(
        'wife',
        `wife-${i + 1}`,
        each,
        wives === 1 ? formatPortion(pool) : `${formatPortion(pool)} ÷ ${wives}`,
        false,
      )
    }
  }

  // Mother (Quran 4:11). Umariyyatayn when parents + spouse and no children:
  // mother takes 1/3 of what remains after the spouse, not 1/3 of the whole estate.
  if (mother) {
    let portion: number
    let fraction: string
    if (hasChildren) {
      portion = 1 / 6
      fraction = '1/6'
    } else if (father && (husbandAlive || wives > 0)) {
      const afterSpouse = 1 - (husbandAlive ? 1 / 2 : 1 / 4)
      portion = afterSpouse / 3
      fraction =
        husbandAlive
          ? '1/3 of residue after husband (1/6)'
          : '1/3 of residue after wife (1/4)'
    } else {
      portion = 1 / 3
      fraction = '1/3'
    }
    pushFixed('mother', 'mother', portion, fraction, true)
  }

  // Father: 1/6 with any children; otherwise asaba only (handled later).
  // With daughters only (no son), father also takes residue as asaba after fixed shares.
  if (father && hasChildren) {
    pushFixed('father', 'father-fixed', 1 / 6, '1/6', true)
  }

  // Daughters alone (no son): fixed 1/2 (one) or 2/3 (two+)
  if (!hasSon && daughters > 0) {
    const pool = daughters === 1 ? 1 / 2 : 2 / 3
    const each = pool / daughters
    for (let i = 0; i < daughters; i += 1) {
      pushFixed(
        'daughter',
        `daughter-fixed-${i + 1}`,
        each,
        daughters === 1 ? '1/2' : `2/3 ÷ ${daughters}`,
        true,
      )
    }
  }

  let appliedAwl = false
  let appliedRadd = false

  // Awl: fixed shares exceed the estate → scale all fixed shares down.
  if (fixedTotal > 1 + 1e-12) {
    appliedAwl = true
    const scale = 1 / fixedTotal
    for (const s of shares) {
      s.portion *= scale
      s.fraction = `${s.fraction} (awl)`
    }
    fixedTotal = 1
  }

  const hasAsaba =
    hasSon || (father && !hasChildren) || (father && !hasSon && daughters > 0)

  let residue = Math.max(0, 1 - fixedTotal)

  if (residue > 1e-12 && hasSon) {
    // Sons (and daughters with them) take residue 2:1
    const units = sons * 2 + daughters
    const unit = residue / units
    for (let i = 0; i < sons; i += 1) {
      shares.push({
        heir: 'son',
        id: `son-${i + 1}`,
        fraction: '2 parts of residue (asaba)',
        portion: unit * 2,
        raddEligible: false,
        isAsaba: true,
      })
    }
    for (let i = 0; i < daughters; i += 1) {
      shares.push({
        heir: 'daughter',
        id: `daughter-asaba-${i + 1}`,
        fraction: '1 part of residue (asaba)',
        portion: unit,
        raddEligible: false,
        isAsaba: true,
      })
    }
    residue = 0
  } else if (residue > 1e-12 && father && (!hasChildren || (!hasSon && daughters > 0))) {
    // Father asaba: no children, or daughters only (already took 1/6 fixed)
    const existing = shares.find((s) => s.heir === 'father')
    if (existing) {
      existing.portion += residue
      existing.fraction = `${existing.fraction} + residue (asaba)`
      existing.isAsaba = true
    } else {
      shares.push({
        heir: 'father',
        id: 'father-asaba',
        fraction: 'residue (asaba)',
        portion: residue,
        raddEligible: false,
        isAsaba: true,
      })
    }
    residue = 0
  } else if (residue > 1e-12 && !hasAsaba) {
    // Radd: return surplus to blood fixed-share heirs (not spouse)
    const raddHeirs = shares.filter((s) => s.raddEligible)
    if (raddHeirs.length > 0) {
      appliedRadd = true
      const raddBase = raddHeirs.reduce((sum, s) => sum + s.portion, 0)
      for (const s of raddHeirs) {
        const add = residue * (s.portion / raddBase)
        s.portion += add
        s.fraction = `${s.fraction} + radd`
      }
      residue = 0
    } else {
      // Only spouse (or no blood heirs): leftover stays marked
      shares.push({
        heir: 'residue',
        id: 'residue',
        fraction: 'unassigned',
        portion: residue,
        raddEligible: false,
        isAsaba: false,
      })
      residue = 0
    }
  } else if (residue > 1e-12) {
    shares.push({
      heir: 'residue',
      id: 'residue',
      fraction: 'unassigned',
      portion: residue,
      raddEligible: false,
      isAsaba: false,
    })
  }

  const resultShares: InheritanceShare[] = shares
    .filter((s) => s.portion > 1e-12)
    .map((s) => ({
      heir: s.heir,
      id: s.id,
      fraction: s.fraction,
      portion: s.portion,
      amount: estatePortionAmount(estate, s.portion),
    }))

  if (resultShares.length === 0) {
    return {
      shares: [],
      appliedAwl: false,
      appliedRadd: false,
      noteKeys: ['empty'],
    }
  }

  const noteKeys: InheritanceNoteKey[] = ['base']
  if (appliedAwl) noteKeys.push('awl')
  if (appliedRadd) noteKeys.push('radd')

  return {
    shares: resultShares,
    appliedAwl,
    appliedRadd,
    noteKeys,
  }
}
