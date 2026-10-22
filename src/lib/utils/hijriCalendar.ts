import { formatGregorianLabel as formatGregorianLabelLocale } from '@/lib/i18n/localeFormat'

export const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

/** Gregorian DD-MM-YYYY → localized short date. Pass language for correct digits. */
export function formatGregorianLabel(date: string, language = 'en'): string {
  return formatGregorianLabelLocale(date, language)
}

/** Hijri year for the current or upcoming Ramadan (month 9). */
export function resolveRamadanHijriYear(hijriMonth: number, hijriYear: number): number {
  return hijriMonth > 9 ? hijriYear + 1 : hijriYear
}
