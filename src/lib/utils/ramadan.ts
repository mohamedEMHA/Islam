import { hijriToGregorian } from '@/lib/api/aladhan'
import { resolveRamadanHijriYear } from '@/lib/utils/hijriCalendar'
import { parseDmy } from '@/lib/utils/dateParse'

export interface CountdownParts {
  targetDate: Date
  days: number
  hours: number
  minutes: number
  seconds: number
  inRamadan: boolean
  ramadanHijriYear: number
}

export interface RamadanTarget {
  targetDate: Date
  inRamadan: boolean
  ramadanHijriYear: number
}

function parseGregorianDate(dateStr: string): Date {
  return parseDmy(dateStr) ?? new Date(NaN)
}

export function computeCountdownFromTarget(target: RamadanTarget, now = new Date()): CountdownParts {
  if (target.inRamadan) {
    return {
      targetDate: target.targetDate,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      inRamadan: true,
      ramadanHijriYear: target.ramadanHijriYear,
    }
  }

  const ms = Math.max(0, target.targetDate.getTime() - now.getTime())
  const totalSeconds = Math.floor(ms / 1000)

  return {
    targetDate: target.targetDate,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    inRamadan: false,
    ramadanHijriYear: target.ramadanHijriYear,
  }
}

export async function resolveRamadanTarget(
  hijriMonth: number,
  hijriYear: number,
): Promise<RamadanTarget> {
  const inRamadan = hijriMonth === 9
  const ramadanHijriYear = resolveRamadanHijriYear(hijriMonth, hijriYear)

  if (inRamadan) {
    return {
      targetDate: new Date(),
      inRamadan: true,
      ramadanHijriYear: hijriYear,
    }
  }

  const gregorian = await hijriToGregorian(1, 9, ramadanHijriYear)
  return {
    targetDate: parseGregorianDate(gregorian),
    inRamadan: false,
    ramadanHijriYear,
  }
}
