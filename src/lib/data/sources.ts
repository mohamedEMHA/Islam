export interface TrustBadge {
  id: string
  label: string
  icon: string
  url: string
}

export const HOME_TRUST_BADGES: TrustBadge[] = [
  {
    id: 'aladhan',
    label: 'Prayer Times',
    icon: 'schedule',
    url: 'https://aladhan.com/prayer-times-api',
  },
  {
    id: 'quran',
    label: 'Quran',
    icon: 'menu_book',
    url: 'https://quran.com',
  },
  {
    id: 'hadith',
    label: 'Hadith',
    icon: 'library_books',
    url: 'https://github.com/fawazahmed0/hadith-api',
  },
  {
    id: 'duas',
    label: 'Duas',
    icon: 'auto_stories',
    url: 'https://sunnah.com',
  },
  {
    id: 'zakat',
    label: 'Zakat',
    icon: 'calculate',
    url: 'https://ummahapi.com',
  },
]
