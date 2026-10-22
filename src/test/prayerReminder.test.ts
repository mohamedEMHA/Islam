import { describe, expect, it } from 'vitest'
import {
  isSilentPrayerReminders,
  resolvePrayerReminderDispatch,
} from '@/lib/notifications/prayerReminder'
import { DEFAULT_SETTINGS } from '@/types/settings'

const baseNotifications = DEFAULT_SETTINGS.notifications

describe('prayer reminder dispatch', () => {
  it('treats missing silentNotifications as audible reminders', () => {
    const notifications = { ...baseNotifications, silentNotifications: undefined as unknown as boolean }
    expect(isSilentPrayerReminders(notifications)).toBe(false)
  })

  it('skips adhan when silent reminders are enabled', () => {
    const notifications = { ...baseNotifications, silentNotifications: true }
    expect(resolvePrayerReminderDispatch(notifications, true)).toEqual({
      showNotification: true,
      playAdhan: false,
      notificationSilent: true,
    })
  })

  it('plays adhan with notification when silent reminders are disabled', () => {
    const notifications = { ...baseNotifications, silentNotifications: false }
    expect(resolvePrayerReminderDispatch(notifications, true)).toEqual({
      showNotification: true,
      playAdhan: true,
      notificationSilent: false,
    })
  })

  it('still plays adhan without notification permission when not silent', () => {
    const notifications = { ...baseNotifications, silentNotifications: false }
    expect(resolvePrayerReminderDispatch(notifications, false)).toEqual({
      showNotification: false,
      playAdhan: true,
      notificationSilent: false,
    })
  })

  it('never plays adhan when silent even without notification permission', () => {
    const notifications = { ...baseNotifications, silentNotifications: true }
    expect(resolvePrayerReminderDispatch(notifications, false)).toEqual({
      showNotification: false,
      playAdhan: false,
      notificationSilent: true,
    })
  })
})
