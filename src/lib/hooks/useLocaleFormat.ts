import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatAppInteger,
  formatAppNumber,
  formatAppNumericString,
  formatCountdown,
  formatCountdownHms,
  formatGregorianLabel,
  formatTime12,
  resolveIntlLocale,
} from '@/lib/i18n/localeFormat'

/** Locale-aware number/time/date formatters bound to the active i18n language. */
export function useLocaleFormat() {
  const { i18n } = useTranslation()
  const language = i18n.language

  return useMemo(
    () => ({
      language,
      intlLocale: resolveIntlLocale(language),
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
        formatAppNumber(value, language, options),
      formatInteger: (value: number) => formatAppInteger(value, language),
      formatNumericString: (value: string | number) => formatAppNumericString(value, language),
      formatTime12: (time24: string) => formatTime12(time24, language),
      formatCountdown: (seconds: number) => formatCountdown(seconds, language),
      formatCountdownHms: (seconds: number) => formatCountdownHms(seconds, language),
      formatGregorianLabel: (date: string) => formatGregorianLabel(date, language),
    }),
    [language],
  )
}
