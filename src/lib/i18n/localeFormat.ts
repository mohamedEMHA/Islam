import type { AppLanguage } from '@/i18n/config'
import { stripAlAdhanTime } from '@/lib/utils/prayerTime'

/** BCP 47 tags that produce expected digit scripts (Eastern Arabic for ar, etc.). */
const INTL_LOCALE_BY_APP: Record<AppLanguage, string> = {
  en: 'en-US',
  ar: 'ar-EG',
  ur: 'ur-PK',
  id: 'id-ID',
  fr: 'fr-FR',
}

export function resolveIntlLocale(language: string): string {
  const base = language.split('-')[0].toLowerCase() as AppLanguage
  return INTL_LOCALE_BY_APP[base] ?? INTL_LOCALE_BY_APP.en
}

export function formatAppNumber(
  value: number,
  language: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(resolveIntlLocale(language), options).format(value)
}

export function formatAppInteger(value: number, language: string): string {
  return formatAppNumber(value, language, { maximumFractionDigits: 0 })
}

/** Format a numeric string (e.g. hijri day/year from AlAdhan) with locale digits. */
export function formatAppNumericString(value: string | number, language: string): string {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return String(value)
  return formatAppInteger(n, language)
}

/**
 * 12-hour clock with localized digits and AM/PM (or locale-native day period).
 * Falls back to Latin AM/PM when Intl does not provide dayPeriod.
 */
export function formatTime12(time24: string, language = 'en'): string {
  const cleaned = stripAlAdhanTime(time24)
  const [h, m] = cleaned.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time24

  const date = new Date(2000, 0, 1, h, m, 0)
  const intlLocale = resolveIntlLocale(language)

  try {
    const formatted = new Intl.DateTimeFormat(intlLocale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
    return formatted
  } catch {
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    const hourStr = formatAppInteger(hour12, language)
    const paddedMin = new Intl.NumberFormat(intlLocale, {
      minimumIntegerDigits: 2,
      maximumFractionDigits: 0,
    }).format(m)
    return `${hourStr}:${paddedMin} ${period}`
  }
}

export function formatCountdown(seconds: number, language = 'en'): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${formatAppInteger(h, language)}h ${formatAppInteger(m, language)}m`
  }
  return `${formatAppInteger(m, language)}m ${formatAppInteger(s, language)}s`
}

/** HH:MM:SS countdown used by prayer cards. */
export function formatCountdownHms(seconds: number, language = 'en'): string {
  const safe = Math.max(0, Math.floor(seconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  const opts: Intl.NumberFormatOptions = {
    minimumIntegerDigits: 2,
    maximumFractionDigits: 0,
  }
  return [
    formatAppNumber(h, language, opts),
    formatAppNumber(m, language, opts),
    formatAppNumber(s, language, opts),
  ].join(':')
}

/** Gregorian DD-MM-YYYY from AlAdhan → localized short date. */
export function formatGregorianLabel(date: string, language = 'en'): string {
  const [day, month, year] = date.split('-').map(Number)
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return date
  }
  const d = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat(resolveIntlLocale(language), {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(d)
}
