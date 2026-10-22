import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getPersistedLanguage } from '@/lib/utils/persistedSettings'
import en from './locales/en.json'
import type { AppLanguage } from '@/i18n/config'

const localeLoaders: Record<Exclude<AppLanguage, 'en'>, () => Promise<{ default: Record<string, unknown> }>> = {
  ar: () => import('./locales/ar.json'),
  ur: () => import('./locales/ur.json'),
  id: () => import('./locales/id.json'),
  fr: () => import('./locales/fr.json'),
}

const loadedLocales = new Set<AppLanguage>(['en'])

export async function ensureLocaleLoaded(language: string): Promise<void> {
  const lng = language as AppLanguage
  if (loadedLocales.has(lng) || lng === 'en') {
    loadedLocales.add('en')
    return
  }
  const loader = localeLoaders[lng as Exclude<AppLanguage, 'en'>]
  if (!loader) return
  const mod = await loader()
  i18n.addResourceBundle(lng, 'translation', mod.default, true, true)
  loadedLocales.add(lng)
}

const initialLanguage = getPersistedLanguage()

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  partialBundledLanguages: true,
})

if (initialLanguage !== 'en') {
  void ensureLocaleLoaded(initialLanguage).then(() => {
    void i18n.changeLanguage(initialLanguage)
  })
}

export default i18n
