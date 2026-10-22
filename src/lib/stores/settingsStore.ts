import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getDefaultTranslationEdition } from '@/lib/api/quran'
import { DEFAULT_SETTINGS, type NotificationSettings, type UserSettings } from '@/types/settings'

type SettingsUpdate = Omit<Partial<UserSettings>, 'notifications'> & {
  notifications?: Partial<NotificationSettings>
}

interface SettingsState extends UserSettings {
  updateSettings: (partial: SettingsUpdate) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => {
          const { notifications: notificationPatch, ...rest } = partial
          let next: SettingsState = { ...state, ...rest } as SettingsState

          if (notificationPatch) {
            next = {
              ...next,
              notifications: { ...state.notifications, ...notificationPatch },
            }
          }

          // Language change: auto-switch Quran edition unless user picked one explicitly.
          if (
            typeof rest.language === 'string' &&
            rest.language !== state.language &&
            rest.translationEdition === undefined
          ) {
            if (!state.translationEditionTouched) {
              next.translationEdition = getDefaultTranslationEdition(rest.language)
            }
          }

          // Explicit edition change marks as user-touched.
          if (
            typeof rest.translationEdition === 'string' &&
            rest.translationEdition !== state.translationEdition &&
            rest.translationEditionTouched === undefined
          ) {
            next.translationEditionTouched = true
          }

          return next
        }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'islam-settings',
      version: 5,
      partialize: (state) => ({
        calculationMethod: state.calculationMethod,
        madhab: state.madhab,
        tune: state.tune,
        highLatitudeRule: state.highLatitudeRule,
        hijriAdjustment: state.hijriAdjustment,
        theme: state.theme,
        language: state.language,
        quranFontSize: state.quranFontSize,
        quranScript: state.quranScript,
        quranReaderMode: state.quranReaderMode,
        reciterId: state.reciterId,
        translationEdition: state.translationEdition,
        translationEditionTouched: state.translationEditionTouched,
        notifications: state.notifications,
        location: state.location,
        onboardingComplete: state.onboardingComplete,
      }),
      migrate: (persistedState, version) => {
        const state = {
          ...DEFAULT_SETTINGS,
          ...(persistedState as Partial<UserSettings>),
        }
        if (version < 2) {
          state.notifications = {
            ...DEFAULT_SETTINGS.notifications,
            ...state.notifications,
          }
        }
        if (version < 3) {
          state.notifications = {
            ...DEFAULT_SETTINGS.notifications,
            ...state.notifications,
            silentNotifications: state.notifications.silentNotifications ?? false,
          }
        }
        if (version < 4) {
          state.quranReaderMode = state.quranReaderMode ?? 'study'
        }
        if (version < 5) {
          state.translationEditionTouched = state.translationEditionTouched ?? false
          if (!state.translationEditionTouched && state.language) {
            state.translationEdition = getDefaultTranslationEdition(state.language)
          }
        }
        return state as SettingsState
      },
    },
  ),
)
