import { getCategoryCount, getCategoryMeta, getDuasForCategory } from '@/lib/data/duas'

export interface DuaCategory {
  id: string
  name: string
  nameAr: string
  icon: string
  count: number
}

export interface Dua {
  id: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
  category: string
}

export function getDuaCategories(): DuaCategory[] {
  return getCategoryMeta().map((category) => ({
    ...category,
    count: getCategoryCount(category.id),
  }))
}

export async function getDuasByCategory(categoryId: string): Promise<Dua[]> {
  return getDuasForCategory(categoryId).map((dua) => ({
    ...dua,
    category: categoryId,
  }))
}
