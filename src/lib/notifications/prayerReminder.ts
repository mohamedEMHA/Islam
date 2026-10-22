import type { NotificationSettings } from '@/types/settings'

export interface PrayerReminderDispatch {
  showNotification: boolean
  playAdhan: boolean
  notificationSilent: boolean
}

export function isSilentPrayerReminders(notifications: NotificationSettings): boolean {
  return notifications.silentNotifications === true
}

export function resolvePrayerReminderDispatch(
  notifications: NotificationSettings,
  notifyGranted: boolean,
): PrayerReminderDispatch {
  const silent = isSilentPrayerReminders(notifications)

  return {
    showNotification: notifyGranted,
    playAdhan: !silent,
    notificationSilent: silent,
  }
}
