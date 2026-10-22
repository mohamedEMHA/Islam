export const HADITH_COLLECTION_IDS = [
  'bukhari',
  'muslim',
  'abudawud',
  'tirmidhi',
  'nasai',
  'ibnmajah',
  'malik',
  'nawawi',
  'qudsi',
  'dehlawi',
] as const

export type HadithCollectionId = (typeof HADITH_COLLECTION_IDS)[number]

export interface HadithCollectionMeta {
  id: HadithCollectionId
  name: string
  description: string
}

export const HADITH_COLLECTIONS_SEO: readonly HadithCollectionMeta[] = [
  { id: 'bukhari', name: 'Sahih al-Bukhari', description: 'The most authentic hadith collection' },
  { id: 'muslim', name: 'Sahih Muslim', description: 'Second most authentic hadith collection' },
  { id: 'abudawud', name: 'Sunan Abu Dawud', description: 'Hadith focused on legal rulings' },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi', description: 'Hadith with grading commentary' },
  { id: "nasai", name: "Sunan an-Nasa'i", description: 'Rigorous authentication of hadith' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', description: 'One of the six major hadith books' },
  { id: 'malik', name: 'Muwatta Malik', description: 'Earliest written hadith collection' },
  { id: 'nawawi', name: 'Forty Hadith of an-Nawawi', description: 'Essential principles of faith' },
  { id: 'qudsi', name: 'Forty Hadith Qudsi', description: 'Sacred hadith from Allah' },
  { id: 'dehlawi', name: 'Forty Hadith of Shah Waliullah', description: 'Selected foundational hadith' },
]

export function isHadithCollectionId(id: string): id is HadithCollectionId {
  return (HADITH_COLLECTION_IDS as readonly string[]).includes(id)
}

/** SEO entry ids only: short numeric with optional letter suffix (blocks quota abuse). */
export function isSafeHadithSeoId(id: string): boolean {
  return /^\d{1,5}[a-z]?$/.test(id)
}

export function getHadithCollectionMeta(id: string): HadithCollectionMeta | undefined {
  return HADITH_COLLECTIONS_SEO.find((c) => c.id === id)
}
