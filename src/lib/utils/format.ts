/** Re-export locale-aware formatters; prefer useLocaleFormat() in React components. */
export {
  formatCountdown,
  formatCountdownHms,
  formatTime12,
} from '@/lib/i18n/localeFormat'

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
