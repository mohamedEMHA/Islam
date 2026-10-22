import { parseDmy } from '@/lib/utils/dateParse'
import { hijriToGregorian } from '@/lib/api/aladhan'

export interface IslamicEventDef {
  id: string
  nameKey: string
  hijriDay: number
  hijriMonth: number
}

export const ISLAMIC_EVENTS: IslamicEventDef[] = [
  { id: 'islamic_new_year', nameKey: 'events.islamicNewYear', hijriDay: 1, hijriMonth: 1 },
  { id: 'mawlid', nameKey: 'events.mawlid', hijriDay: 12, hijriMonth: 3 },
  { id: 'isra_miraj', nameKey: 'events.israMiraj', hijriDay: 27, hijriMonth: 7 },
  { id: 'ramadan_start', nameKey: 'events.ramadanStart', hijriDay: 1, hijriMonth: 9 },
  { id: 'laylat_al_qadr', nameKey: 'events.laylatAlQadr', hijriDay: 27, hijriMonth: 9 },
  { id: 'eid_al_fitr', nameKey: 'events.eidAlFitr', hijriDay: 1, hijriMonth: 10 },
  { id: 'day_of_arafah', nameKey: 'events.dayOfArafah', hijriDay: 9, hijriMonth: 12 },
  { id: 'eid_al_adha', nameKey: 'events.eidAlAdha', hijriDay: 10, hijriMonth: 12 },
]

export const HIJRI_MONTH_KEYS = [
  '',
  'hijriMonths.muharram',
  'hijriMonths.safar',
  'hijriMonths.rabiAlAwal',
  'hijriMonths.rabiAlThani',
  'hijriMonths.jumadaAlAwwal',
  'hijriMonths.jumadaAlThani',
  'hijriMonths.rajab',
  'hijriMonths.shaban',
  'hijriMonths.ramadan',
  'hijriMonths.shawwal',
  'hijriMonths.dhulQadah',
  'hijriMonths.dhulHijjah',
] as const

export interface UpcomingEvent {
  event: IslamicEventDef
  gregorianDate: Date
  daysUntil: number
  isRamadan: boolean
}

function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function daysBetween(from: Date, to: Date): number {
  const a = startOfDay(from).getTime()
  const b = startOfDay(to).getTime()
  return Math.round((b - a) / 86_400_000)
}

/** Pick the soonest upcoming event from resolved gregorian dates (DD-MM-YYYY). */
export function pickNextEvent(
  resolved: Array<{ event: IslamicEventDef; gregorian: string }>,
  now = new Date(),
): UpcomingEvent | null {
  const today = startOfDay(now)
  let best: UpcomingEvent | null = null

  for (const item of resolved) {
    const date = parseDmy(item.gregorian)
    if (!date) continue
    const day = startOfDay(date)
    const daysUntil = daysBetween(today, day)
    if (daysUntil < 0) continue
    if (!best || daysUntil < best.daysUntil) {
      best = {
        event: item.event,
        gregorianDate: day,
        daysUntil,
        isRamadan: item.event.id === 'ramadan_start',
      }
    }
  }

  return best
}

export const SEASONAL_BANNER_MAX_DAYS = 60

/** Resolve Gregorian DMY strings for all events in a Hijri year. */
export async function resolveEventDates(
  hijriYear: number,
): Promise<Array<{ event: IslamicEventDef; gregorian: string }>> {
  const results = await Promise.all(
    ISLAMIC_EVENTS.map(async (event) => {
      try {
        const gregorian = await hijriToGregorian(event.hijriDay, event.hijriMonth, hijriYear)
        return { event, gregorian }
      } catch {
        return null
      }
    }),
  )
  return results.filter(Boolean) as Array<{ event: IslamicEventDef; gregorian: string }>
}
