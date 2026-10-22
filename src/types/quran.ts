export interface SurahMeta {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

export interface Ayah {
  number: number
  numberInSurah: number
  text: string
  translation?: string
}

export interface AyahMetadata {
  numberInSurah: number
  juz?: number
  manzil?: number
  page?: number
  ruku?: number
  hizbQuarter?: number
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[]
}

export type QuranScript = 'uthmani' | 'indopak'

export interface Reciter {
  id: string
  name: string
  style: string
}

export interface AyahWord {
  position: number
  text: string
  translation: string
  transliteration: string
}
