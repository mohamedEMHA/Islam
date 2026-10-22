import { beforeEach, describe, expect, it } from 'vitest'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { DEFAULT_SETTINGS } from '@/types/settings'

describe('settingsStore notifications merge', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      ...DEFAULT_SETTINGS,
      notifications: { ...DEFAULT_SETTINGS.notifications },
    })
  })

  it('preserves silentNotifications when updating a prayer toggle without spread', () => {
    useSettingsStore.getState().updateSettings({
      notifications: {
        silentNotifications: true,
      },
    })

    useSettingsStore.getState().updateSettings({
      notifications: {
        fajr: false,
      },
    })

    expect(useSettingsStore.getState().notifications.silentNotifications).toBe(true)
    expect(useSettingsStore.getState().notifications.fajr).toBe(false)
    expect(useSettingsStore.getState().notifications.muezzinId).toBe('mishary')
  })

  it('auto-switches Quran translation when language changes unless touched', () => {
    useSettingsStore.getState().updateSettings({ language: 'ur' })
    expect(useSettingsStore.getState().translationEdition).toBe('ur.ahmedali')
    expect(useSettingsStore.getState().translationEditionTouched).toBe(false)

    useSettingsStore.getState().updateSettings({ translationEdition: 'en.pickthall' })
    expect(useSettingsStore.getState().translationEditionTouched).toBe(true)

    useSettingsStore.getState().updateSettings({ language: 'fr' })
    expect(useSettingsStore.getState().translationEdition).toBe('en.pickthall')
  })
})
