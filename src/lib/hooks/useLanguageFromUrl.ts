import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getLanguageDirection,
  parseLocalePath,
  type LocaleCode,
} from '@/lib/i18n/localizedPath'
import { useSettingsStore } from '@/lib/stores/settingsStore'

/** Sync i18n + document lang/dir from URL locale prefix (URL wins over localStorage). */
export function useLanguageFromUrl(): LocaleCode {
  const { pathname } = useLocation()
  const { i18n } = useTranslation()
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const { locale } = parseLocalePath(pathname)

  useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale)
    }
    updateSettings({ language: locale })
    document.documentElement.lang = locale
    document.documentElement.dir = getLanguageDirection(locale)
  }, [locale, i18n, updateSettings])

  return locale
}
