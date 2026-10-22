export interface ShahadaPart {
  id: string
  arabic: string
  transliterationKey: string
  translationKey: string
}

export const SHAHADA_PARTS: ShahadaPart[] = [
  {
    id: 'tawhid',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliterationKey: 'pages.shahada.part1Transliteration',
    translationKey: 'pages.shahada.part1Translation',
  },
  {
    id: 'risalah',
    arabic: 'وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
    transliterationKey: 'pages.shahada.part2Transliteration',
    translationKey: 'pages.shahada.part2Translation',
  },
]

export const SHAHADA_FULL_ARABIC =
  'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ'
