export type HadithGrade = 'sahih' | 'hasan' | 'daif' | 'unknown'

export interface HadithCollection {
  id: string
  name: string
  description: string
  count: number
  sunnahSlug?: string
  fortyBookNumber?: string
}

export interface HadithBook {
  collection: string
  bookNumber: string
  nameEn: string
  nameAr?: string
  introEn?: string
  introAr?: string
  hadithStartNumber: number
  hadithEndNumber: number
  hadithCount: number
}

export interface HadithChapter {
  collection: string
  bookNumber: string
  chapterId: string
  chapterNumber: string
  titleEn?: string
  titleAr?: string
  introEn?: string
  introAr?: string
}

export interface HadithReference {
  bookNumber?: string
  hadithNumber?: string
  uscMsa?: string
  arabicRef?: string
  urn?: number
  urnArabic?: number
}

export interface HadithIsnadSegment {
  narratorId?: string
  name: string
}

export interface HadithEntry {
  collection: string
  /** Provider id: "1", "8 a", "2788, 2789", etc. */
  id: string
  arabic: string
  english: string
  grade: HadithGrade
  narrator?: string
  book?: string
  bookNumber?: string
  chapter?: string
  chapterId?: string
  chapterIntro?: string
  references?: HadithReference
  isnad?: HadithIsnadSegment[]
  source?: 'fawazahmed0' | 'sunnah.com' | 'islamic.app'
}
