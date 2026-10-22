import { useEffect, useRef, useState } from 'react'
import i18n from '@/i18n'
import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { playAdhan } from '@/lib/hooks/useAdhanPlayer'
import { getHadith } from '@/lib/api/hadith'
import {
  CATCH_UP_WINDOW_MS,
  CHECK_INTERVAL_MS,
  findDuePrayer,
  isMorningReminderWindow,
} from '@/lib/notifications/schedule'
import { resolvePrayerReminderDispatch } from '@/lib/notifications/prayerReminder'
import { formatDateInTimeZone, browserTimeZone } from '@/lib/utils/prayerTime'

const NOTIFIED_KEY = 'islam-prayer-notified'

const HADITH_POOL = [
  { collection: 'bukhari', number: 1 },
  { collection: 'muslim', number: 45 },
  { collection: 'tirmidhi', number: 2516 },
]

function todayKey(timeZone = browserTimeZone()): string {
  return formatDateInTimeZone(new Date(), timeZone)
}

function pruneNotifiedMap(map: Record<string, boolean>, timeZone: string): Record<string, boolean> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffStr = formatDateInTimeZone(cutoff, timeZone)

  const pruned: Record<string, boolean> = {}
  for (const [key, value] of Object.entries(map)) {
    const datePart = key.slice(0, 10)
    if (datePart >= cutoffStr) {
      pruned[key] = value
    }
  }
  return pruned
}

function getNotified(timeZone: string): Record<string, boolean> {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? '{}') as Record<string, boolean>
    const pruned = pruneNotifiedMap(raw, timeZone)
    if (Object.keys(pruned).length !== Object.keys(raw).length) {
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(pruned))
    }
    return pruned
  } catch {
    return {}
  }
}

function setNotified(id: string, timeZone: string) {
  const key = `${todayKey(timeZone)}-${id}`
  const map = getNotified(timeZone)
  map[key] = true
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(map))
}

function wasNotified(id: string, timeZone: string): boolean {
  return getNotified(timeZone)[`${todayKey(timeZone)}-${id}`] === true
}

function daySeed(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86400000)
}

async function fetchDailyHadithText(): Promise<string> {
  const seed = daySeed()
  const pick = HADITH_POOL[seed % HADITH_POOL.length]
  try {
    const hadith = await getHadith(pick.collection, String(pick.number))
    const excerpt = hadith.english.length > 160 ? `${hadith.english.slice(0, 157)}...` : hadith.english
    return `${excerpt} (${pick.collection} #${hadith.id})`
  } catch {
    return i18n.t('notifications.dailyHadithFallback')
  }
}

function canUseNotifications(): boolean {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted'
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof Notification === 'undefined') return 'denied'
  return Notification.permission
}

export function usePrayerNotifications() {
  const { data } = usePrayerTimes()
  const notifications = useSettingsStore((s) => s.notifications)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hadithInFlightRef = useRef(false)
  const [permission, setPermission] = useState(getNotificationPermission)

  useEffect(() => {
    if (typeof Notification === 'undefined') return

    const syncPermission = () => setPermission(Notification.permission)
    syncPermission()

    let cancelled = false
    let permissionStatus: PermissionStatus | null = null

    void navigator.permissions
      ?.query({ name: 'notifications' as PermissionName })
      .then((status) => {
        if (cancelled) return
        permissionStatus = status
        status.onchange = syncPermission
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (permissionStatus) permissionStatus.onchange = null
    }
  }, [])

  useEffect(() => {
    if (!data) return

    const timeZone = data.meta.timezone || browserTimeZone()
    const anyEnabled =
      notifications.fajr ||
      notifications.dhuhr ||
      notifications.asr ||
      notifications.maghrib ||
      notifications.isha ||
      notifications.whiteDays ||
      notifications.monThuFasting ||
      notifications.dailyHadith

    if (!anyEnabled) return

    const check = (windowMs?: number) => {
      const now = new Date()
      const hijriDay = Number(data.date.hijri.day)
      const notifyGranted = canUseNotifications()
      const currentNotifications = useSettingsStore.getState().notifications
      const reminderDispatch = resolvePrayerReminderDispatch(currentNotifications, notifyGranted)

      const duePrayer = findDuePrayer(
        now,
        data.timings,
        currentNotifications,
        (id) => wasNotified(id, timeZone),
        timeZone,
        windowMs,
      )
      if (duePrayer) {
        const time = data.timings[duePrayer]
        setNotified(duePrayer, timeZone)
        if (reminderDispatch.showNotification) {
          new Notification(i18n.t('notifications.prayerTitle', { prayer: duePrayer }), {
            body: i18n.t('notifications.prayerBody', { prayer: duePrayer, time }),
            icon: '/logo.png',
            silent: reminderDispatch.notificationSilent,
          })
        }
        if (reminderDispatch.playAdhan) {
          void playAdhan(currentNotifications.muezzinId)
        }
      }

      if (isMorningReminderWindow(now)) {
        if (notifications.whiteDays && [13, 14, 15].includes(hijriDay) && !wasNotified('whiteDays', timeZone)) {
          setNotified('whiteDays', timeZone)
          if (notifyGranted) {
            new Notification(i18n.t('notifications.whiteDaysTitle'), {
              body: i18n.t('notifications.whiteDaysBody'),
            })
          }
        }

        const dow = now.getDay()
        if (notifications.monThuFasting && (dow === 1 || dow === 4) && !wasNotified('monThu', timeZone)) {
          setNotified('monThu', timeZone)
          if (notifyGranted) {
            new Notification(i18n.t('notifications.monThuTitle'), {
              body: i18n.t('notifications.monThuBody'),
            })
          }
        }

        if (notifications.dailyHadith && !wasNotified('dailyHadith', timeZone) && !hadithInFlightRef.current) {
          hadithInFlightRef.current = true
          setNotified('dailyHadith', timeZone)
          void fetchDailyHadithText()
            .then((body) => {
              if (notifyGranted) {
                new Notification(i18n.t('notifications.dailyHadithTitle'), { body, icon: '/logo.png' })
              }
            })
            .finally(() => {
              hadithInFlightRef.current = false
            })
        }
      } else {
        hadithInFlightRef.current = false
      }
    }

    check()
    intervalRef.current = setInterval(() => check(), CHECK_INTERVAL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        check(CATCH_UP_WINDOW_MS)
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', onVisible)
      hadithInFlightRef.current = false
    }
  }, [data, notifications, permission])
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}
