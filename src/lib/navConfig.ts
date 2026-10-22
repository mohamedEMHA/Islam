export interface NavItemDef {
  labelKey: string
  path: string
  icon: string
  descriptionKey?: string
}

export interface NavGroupDef {
  id: string
  labelKey: string
  items: NavItemDef[]
}

export const NAV_GROUP_DEFS: NavGroupDef[] = [
  {
    id: 'times',
    labelKey: 'nav.groups.times',
    items: [
      { labelKey: 'nav.items.prayerTimes', path: '/prayer_times', icon: 'schedule', descriptionKey: 'nav.desc.prayerTimes' },
      { labelKey: 'nav.items.adhan', path: '/adhan', icon: 'notifications_active', descriptionKey: 'nav.desc.adhan' },
      { labelKey: 'nav.items.islamicRadio', path: '/islamic_radio', icon: 'radio', descriptionKey: 'nav.desc.islamicRadio' },
      { labelKey: 'nav.items.qibla', path: '/qibla', icon: 'explore', descriptionKey: 'nav.desc.qibla' },
      { labelKey: 'nav.items.hijriCalendar', path: '/hijri_calendar', icon: 'calendar_month', descriptionKey: 'nav.desc.hijriCalendar' },
      { labelKey: 'nav.items.events', path: '/events', icon: 'event', descriptionKey: 'nav.desc.events' },
    ],
  },
  {
    id: 'quran',
    labelKey: 'nav.groups.quran',
    items: [
      { labelKey: 'nav.items.quran', path: '/quran', icon: 'menu_book', descriptionKey: 'nav.desc.quran' },
      { labelKey: 'nav.items.tafsir', path: '/tafsir', icon: 'auto_stories', descriptionKey: 'nav.desc.tafsir' },
      { labelKey: 'nav.items.hadith', path: '/hadith', icon: 'library_books', descriptionKey: 'nav.desc.hadith' },
      { labelKey: 'nav.items.names', path: '/names', icon: 'diamond', descriptionKey: 'nav.desc.names' },
      { labelKey: 'nav.items.shahada', path: '/shahada', icon: 'verified', descriptionKey: 'nav.desc.shahada' },
    ],
  },
  {
    id: 'ramadan',
    labelKey: 'nav.groups.ramadan',
    items: [
      { labelKey: 'nav.items.ramadanHub', path: '/ramadan', icon: 'nights_stay', descriptionKey: 'nav.desc.ramadanHub' },
    ],
  },
  {
    id: 'tools',
    labelKey: 'nav.groups.tools',
    items: [
      { labelKey: 'nav.items.zakat', path: '/zakat', icon: 'calculate', descriptionKey: 'nav.desc.zakat' },
      { labelKey: 'nav.items.tasbeeh', path: '/tasbeeh', icon: 'touch_app', descriptionKey: 'nav.desc.tasbeeh' },
      { labelKey: 'nav.items.duas', path: '/duas', icon: 'volunteer_activism', descriptionKey: 'nav.desc.duas' },
      { labelKey: 'nav.items.hajj', path: '/hajj', icon: 'location_on', descriptionKey: 'nav.desc.hajj' },
      { labelKey: 'nav.items.babyNames', path: '/baby_names', icon: 'child_care', descriptionKey: 'nav.desc.babyNames' },
      { labelKey: 'nav.items.live', path: '/live', icon: 'live_tv', descriptionKey: 'nav.desc.live' },
      { labelKey: 'nav.items.mosqueFinder', path: '/mosque_finder', icon: 'mosque', descriptionKey: 'nav.desc.mosqueFinder' },
      { labelKey: 'nav.items.halalVerification', path: '/halal_verification', icon: 'fact_check', descriptionKey: 'nav.desc.halalVerification' },
      { labelKey: 'nav.items.fatawa', path: '/fatawa', icon: 'gavel', descriptionKey: 'nav.desc.fatawa' },
      { labelKey: 'nav.items.moonSighting', path: '/moon_sighting', icon: 'dark_mode', descriptionKey: 'nav.desc.moonSighting' },
      { labelKey: 'nav.items.inheritance', path: '/inheritance', icon: 'account_balance', descriptionKey: 'nav.desc.inheritance' },
      { labelKey: 'nav.items.islamicLibrary', path: '/islamic_library', icon: 'local_library', descriptionKey: 'nav.desc.islamicLibrary' },
    ],
  },
]

export const APP_LEGAL_LINK_DEFS: NavItemDef[] = [
  { labelKey: 'common.terms', path: '/app/terms', icon: 'description' },
  { labelKey: 'common.privacy', path: '/app/privacy', icon: 'policy' },
]

export const APP_UTILITY_LINK_DEFS: NavItemDef[] = [
  { labelKey: 'nav.items.search', path: '/search', icon: 'search', descriptionKey: 'nav.desc.search' },
  { labelKey: 'footer.share', path: '/share', icon: 'share', descriptionKey: 'pages.share.subtitle' },
  { labelKey: 'nav.items.settings', path: '/settings', icon: 'settings', descriptionKey: 'nav.desc.settings' },
]

export interface FooterLinkDef {
  labelKey: string
  path: string
}

export interface FooterGroupDef {
  id: string
  labelKey: string
  items: FooterLinkDef[]
}

export const FOOTER_GROUP_DEFS: FooterGroupDef[] = [
  {
    id: 'practice',
    labelKey: 'footer.practice',
    items: [
      { labelKey: 'nav.items.prayerTimes', path: '/prayer_times' },
      { labelKey: 'nav.items.adhan', path: '/adhan' },
      { labelKey: 'nav.items.qibla', path: '/qibla' },
      { labelKey: 'nav.items.hijriCalendar', path: '/hijri_calendar' },
      { labelKey: 'nav.items.events', path: '/events' },
      { labelKey: 'nav.items.ramadanHub', path: '/ramadan' },
    ],
  },
  {
    id: 'learn',
    labelKey: 'footer.learn',
    items: [
      { labelKey: 'nav.items.quran', path: '/quran' },
      { labelKey: 'nav.items.tafsir', path: '/tafsir' },
      { labelKey: 'nav.items.hadith', path: '/hadith' },
      { labelKey: 'nav.items.names', path: '/names' },
      { labelKey: 'nav.items.shahada', path: '/shahada' },
      { labelKey: 'nav.items.duas', path: '/duas' },
    ],
  },
  {
    id: 'tools',
    labelKey: 'footer.tools',
    items: [
      { labelKey: 'nav.items.zakat', path: '/zakat' },
      { labelKey: 'nav.items.tasbeeh', path: '/tasbeeh' },
      { labelKey: 'nav.items.hajj', path: '/hajj' },
      { labelKey: 'nav.items.babyNames', path: '/baby_names' },
      { labelKey: 'nav.items.live', path: '/live' },
      { labelKey: 'nav.items.mosqueFinder', path: '/mosque_finder' },
      { labelKey: 'nav.items.halalVerification', path: '/halal_verification' },
    ],
  },
  {
    id: 'app',
    labelKey: 'footer.app',
    items: [
      { labelKey: 'footer.home', path: '/' },
      { labelKey: 'nav.items.search', path: '/search' },
      { labelKey: 'nav.items.settings', path: '/settings' },
      { labelKey: 'footer.share', path: '/share' },
    ],
  },
  {
    id: 'legal',
    labelKey: 'footer.legal',
    items: [
      { labelKey: 'footer.sources', path: '/sources' },
      { labelKey: 'footer.privacy', path: '/privacy' },
      { labelKey: 'footer.terms', path: '/terms' },
    ],
  },
]
