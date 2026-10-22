import type { DuaEntry } from './types'
import { MORNING_DUAS } from './morning'
import { EVENING_DUAS } from './evening'
import { AFTER_PRAYER_DUAS } from './after_prayer'
import { SLEEP_DUAS } from './sleep'
import { FOOD_DUAS } from './food'
import { TRAVEL_DUAS } from './travel'
import { RAMADAN_DUAS } from './ramadan'
import { PROTECTION_DUAS } from './protection'
import { WUDU_DUAS } from './wudu'
import { MOSQUE_DUAS } from './mosque'
import { HOME_DUAS } from './home'
import { DISTRESS_DUAS } from './distress'
import { FORGIVENESS_DUAS } from './forgiveness'

export interface DuaCategoryMeta {
  id: string
  name: string
  nameAr: string
  icon: string
}

const CATEGORY_META: DuaCategoryMeta[] = [
  { id: 'morning', name: 'Morning Adhkar', nameAr: 'أذكار الصباح', icon: 'wb_twilight' },
  { id: 'evening', name: 'Evening Adhkar', nameAr: 'أذكار المساء', icon: 'dark_mode' },
  { id: 'after_prayer', name: 'After Prayer', nameAr: 'أذكار بعد الصلاة', icon: 'mosque' },
  { id: 'sleep', name: 'Sleep Duas', nameAr: 'أذكار النوم', icon: 'bedtime' },
  { id: 'food', name: 'Food Duas', nameAr: 'أذكار الطعام', icon: 'restaurant' },
  { id: 'travel', name: 'Travel Duas', nameAr: 'أذكار السفر', icon: 'flight' },
  { id: 'wudu', name: 'Wudu & Purification', nameAr: 'أذكار الوضوء', icon: 'water_drop' },
  { id: 'mosque', name: 'Mosque & Restroom', nameAr: 'أذكار المسجد', icon: 'door_front' },
  { id: 'home', name: 'Home Duas', nameAr: 'أذكار المنزل', icon: 'home' },
  { id: 'protection', name: 'Protection', nameAr: 'أذكار الحماية', icon: 'shield' },
  { id: 'distress', name: 'Distress & Anxiety', nameAr: 'أذكار الكرب', icon: 'self_improvement' },
  { id: 'forgiveness', name: 'Seeking Forgiveness', nameAr: 'أذكار الاستغفار', icon: 'volunteer_activism' },
  { id: 'ramadan', name: 'Ramadan Duas', nameAr: 'أدعية رمضان', icon: 'nights_stay' },
]

const DUAS_BY_CATEGORY: Record<string, DuaEntry[]> = {
  morning: MORNING_DUAS,
  evening: EVENING_DUAS,
  after_prayer: AFTER_PRAYER_DUAS,
  sleep: SLEEP_DUAS,
  food: FOOD_DUAS,
  travel: TRAVEL_DUAS,
  wudu: WUDU_DUAS,
  mosque: MOSQUE_DUAS,
  home: HOME_DUAS,
  protection: PROTECTION_DUAS,
  distress: DISTRESS_DUAS,
  forgiveness: FORGIVENESS_DUAS,
  ramadan: RAMADAN_DUAS,
}

export function getCategoryMeta(): DuaCategoryMeta[] {
  return CATEGORY_META
}

export function getDuasForCategory(categoryId: string): DuaEntry[] {
  return DUAS_BY_CATEGORY[categoryId] ?? []
}

export function getCategoryCount(categoryId: string): number {
  return getDuasForCategory(categoryId).length
}
