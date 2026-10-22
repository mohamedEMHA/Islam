/** Standard 30-juz surah ranges (inclusive start surah per juz). */
export const JUZ_STARTS: { juz: number; surah: number; name: string }[] = [
  { juz: 1, surah: 1, name: 'Al-Fatihah' },
  { juz: 2, surah: 2, name: 'Al-Baqarah (partial)' },
  { juz: 3, surah: 2, name: 'Al-Baqarah' },
  { juz: 4, surah: 3, name: 'Ali Imran' },
  { juz: 5, surah: 4, name: 'An-Nisa' },
  { juz: 6, surah: 5, name: "Al-Ma'idah" },
  { juz: 7, surah: 6, name: "Al-An'am" },
  { juz: 8, surah: 7, name: "Al-A'raf" },
  { juz: 9, surah: 8, name: 'Al-Anfal' },
  { juz: 10, surah: 9, name: 'At-Tawbah' },
  { juz: 11, surah: 11, name: 'Hud' },
  { juz: 12, surah: 12, name: 'Yusuf' },
  { juz: 13, surah: 15, name: 'Al-Hijr' },
  { juz: 14, surah: 17, name: 'Al-Isra' },
  { juz: 15, surah: 18, name: 'Al-Kahf' },
  { juz: 16, surah: 21, name: 'Al-Anbiya' },
  { juz: 17, surah: 23, name: "Al-Mu'minun" },
  { juz: 18, surah: 25, name: 'Al-Furqan' },
  { juz: 19, surah: 27, name: 'An-Naml' },
  { juz: 20, surah: 29, name: 'Al-Ankabut' },
  { juz: 21, surah: 33, name: 'Al-Ahzab' },
  { juz: 22, surah: 36, name: 'Ya-Sin' },
  { juz: 23, surah: 39, name: 'Az-Zumar' },
  { juz: 24, surah: 41, name: 'Fussilat' },
  { juz: 25, surah: 45, name: 'Al-Jathiyah' },
  { juz: 26, surah: 51, name: 'Adh-Dhariyat' },
  { juz: 27, surah: 58, name: 'Al-Mujadila' },
  { juz: 28, surah: 67, name: 'Al-Mulk' },
  { juz: 29, surah: 78, name: 'An-Naba' },
  { juz: 30, surah: 114, name: 'An-Nas' },
]

export const JUZ_COUNT = 30

export function getSurahsForJuz(juz: number): { start: number; end: number } {
  const idx = juz - 1
  const start = JUZ_STARTS[idx]?.surah ?? 1
  const next = JUZ_STARTS[idx + 1]?.surah
  const end = next ? next - 1 : 114
  return { start, end: Math.max(start, end) }
}

export function getJuzForSurah(surahNumber: number): number {
  for (let i = JUZ_STARTS.length - 1; i >= 0; i--) {
    if (surahNumber >= JUZ_STARTS[i].surah) {
      return JUZ_STARTS[i].juz
    }
  }
  return 1
}
