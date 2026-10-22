import type { PrayerName } from '@/types/prayer'

export function getPrayerNameKey(prayer: PrayerName | string): string {
  return `prayers.${prayer}`
}
