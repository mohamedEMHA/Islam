import type { Theme } from '@/types/settings'
import type { AppLanguage } from '@/i18n/config'

interface PersistedSettingsSlice {
  theme?: Theme
  language?: string
}

export function readPersistedSettings(): PersistedSettingsSlice | null {
  try {
    const raw = localStorage.getItem('islam-settings')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: PersistedSettingsSlice }
    return parsed.state ?? null
  } catch {
    return null
  }
}

export function getPersistedLanguage(): AppLanguage {
  const persisted = readPersistedSettings()
  const lang = persisted?.language
  if (lang === 'ar' || lang === 'ur' || lang === 'id' || lang === 'fr' || lang === 'en') {
    return lang
  }
  return 'en'
}

export function getPersistedTheme(): Theme {
  const persisted = readPersistedSettings()
  return persisted?.theme === 'dark' ? 'dark' : 'light'
}
