export const SUPPORTED_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية (Arabic)' },
  { id: 'ur', label: 'اردو (Urdu)' },
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'fr', label: 'Français' },
] as const

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]['id']

export const RTL_LANGUAGES = new Set<AppLanguage>(['ar', 'ur'])

export function getLanguageDirection(language: string): 'rtl' | 'ltr' {
  return RTL_LANGUAGES.has(language as AppLanguage) ? 'rtl' : 'ltr'
}
