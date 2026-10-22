import type { LocaleCode } from './locale.ts'

export interface PageSeoCopy {
  title: string
  description: string
  h1: string
  body: string
}

type StaticRouteKey =
  | 'home'
  | 'get_app'
  | 'sources'
  | 'privacy'
  | 'terms'
  | 'prayer_times'
  | 'adhan'
  | 'islamic_radio'
  | 'qibla'
  | 'quran'
  | 'hadith'
  | 'duas'
  | 'tafsir'
  | 'ramadan'
  | 'zakat'
  | 'tasbeeh'
  | 'names'
  | 'shahada'
  | 'live'
  | 'hajj'
  | 'baby_names'
  | 'hijri_calendar'
  | 'events'
  | 'mosque_finder'
  | 'halal_verification'
  | 'fatawa'
  | 'moon_sighting'
  | 'inheritance'
  | 'islamic_library'
  | 'settings'
  | 'share'
  | 'welcome'
  | 'search'
  | 'not_found'

const EN: Record<StaticRouteKey, PageSeoCopy> = {
  home: {
    title: 'Islam, Grounded Daily Practice',
    description:
      'Accurate prayer times, the full Quran, authenticated hadith, and daily duas, sourced transparently and free.',
    h1: 'Islam, Grounded Daily Practice',
    body: 'Prayer times, Quran, hadith, duas, qibla, zakat, and more. Ad free and source transparent.',
  },
  get_app: {
    title: 'Get the App',
    description: 'Install Islam as a progressive web app on your phone or desktop for offline-friendly daily practice.',
    h1: 'Get the App',
    body: 'Add Islam to your home screen for quick access to prayer times, Quran, and hadith.',
  },
  sources: {
    title: 'Sources and Attribution',
    description: 'Transparent list of Quran, hadith, prayer time, and other data sources used by Islam.',
    h1: 'Sources and Attribution',
    body: 'Every feature cites its upstream sources so you can verify authenticity.',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How Islam handles device preferences, optional analytics, and your privacy.',
    h1: 'Privacy Policy',
    body: 'Essential preferences stay on your device. Optional analytics run only with consent.',
  },
  terms: {
    title: 'Terms of Service',
    description: 'Terms of use for the Islam web application at islam.house.',
    h1: 'Terms of Service',
    body: 'Read the terms governing use of Islam tools and content.',
  },
  prayer_times: {
    title: 'Prayer Times',
    description: 'Accurate daily salah times for your location with calculation methods and monthly schedule.',
    h1: 'Prayer Times',
    body: 'Fajr, Dhuhr, Asr, Maghrib, and Isha for your city, with method and asr school options.',
  },
  adhan: {
    title: 'Adhan',
    description: 'Listen to the call to prayer with multiple muezzin voices.',
    h1: 'Adhan',
    body: 'Play and preview adhan audio for prayer reminders.',
  },
  islamic_radio: {
    title: 'Islamic Radio',
    description: 'Stream Quran recitation and Islamic radio stations.',
    h1: 'Islamic Radio',
    body: 'Live Quran radio streams for listening and reflection.',
  },
  qibla: {
    title: 'Qibla Direction',
    description: 'Find the direction to the Kaaba from your location with compass support.',
    h1: 'Qibla Direction',
    body: 'Bearing to Makkah with optional live device compass.',
  },
  quran: {
    title: 'The Holy Quran',
    description: 'Read all 114 surahs of the Quran with Arabic text, translation, and audio.',
    h1: 'The Holy Quran',
    body: 'Browse surahs, juz, and revelation order. Read, listen, and reflect.',
  },
  hadith: {
    title: 'Hadith Collections',
    description: 'Authenticated hadith from Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa\'i, Ibn Majah, and more.',
    h1: 'Hadith Collections',
    body: 'Search and read graded hadith across major collections.',
  },
  duas: {
    title: 'Duas and Adhkar',
    description: 'Daily Islamic supplications and remembrances with Arabic and translation.',
    h1: 'Duas and Adhkar',
    body: 'Morning, evening, and situational duas from authentic sources.',
  },
  tafsir: {
    title: 'Tafsir',
    description: 'Quranic commentary by surah and ayah from trusted tafsir editions.',
    h1: 'Tafsir',
    body: 'Explore classical commentary for each surah of the Quran.',
  },
  ramadan: {
    title: 'Ramadan Hub',
    description: 'Suhoor, iftar times, Ramadan calendar, and fasting duas.',
    h1: 'Ramadan Hub',
    body: 'Countdown, fasting schedule, and Ramadan duas for the blessed month.',
  },
  zakat: {
    title: 'Zakat Calculator',
    description: 'Calculate obligatory zakat and zakat al fitr with live metal price cross checks.',
    h1: 'Zakat Calculator',
    body: 'Estimate zakat due on wealth and household fitr obligations.',
  },
  tasbeeh: {
    title: 'Digital Tasbeeh',
    description: 'Count dhikr with a simple digital tasbeeh counter.',
    h1: 'Digital Tasbeeh',
    body: 'Tap to count SubhanAllah, Alhamdulillah, Allahu Akbar, and more.',
  },
  names: {
    title: '99 Names of Allah',
    description: 'Learn the beautiful names of Allah with meaning and pronunciation.',
    h1: '99 Names of Allah',
    body: 'Asma ul Husna with transliteration and brief meanings.',
  },
  shahada: {
    title: 'Shahada',
    description: 'The Islamic declaration of faith with Arabic, transliteration, and meaning.',
    h1: 'Shahada',
    body: 'Learn and recite the testimony of faith.',
  },
  live: {
    title: 'Live Makkah',
    description: 'Watch live Islamic broadcasts from Makkah and related channels.',
    h1: 'Live',
    body: 'Live streams for prayer and sacred sites.',
  },
  hajj: {
    title: 'Hajj and Umrah Guide',
    description: 'Practical guidance for Hajj and Umrah rites and preparation.',
    h1: 'Hajj and Umrah',
    body: 'Steps, duas, and essentials for pilgrimage.',
  },
  baby_names: {
    title: 'Islamic Baby Names',
    description: 'Browse Islamic baby names with meanings for boys and girls.',
    h1: 'Islamic Baby Names',
    body: 'Search meaningful Muslim names from Arabic tradition.',
  },
  hijri_calendar: {
    title: 'Hijri Calendar',
    description: 'Islamic lunar calendar with Hijri dates and conversions.',
    h1: 'Hijri Calendar',
    body: 'View Hijri months and convert between Hijri and Gregorian.',
  },
  events: {
    title: 'Islamic Events',
    description: 'Upcoming Islamic dates, white days, and sacred occasions.',
    h1: 'Islamic Events',
    body: 'Track important days in the Islamic year.',
  },
  mosque_finder: {
    title: 'Mosque Finder',
    description: 'Find nearby mosques on a map using open geographic data.',
    h1: 'Mosque Finder',
    body: 'Locate masajid near your current location.',
  },
  halal_verification: {
    title: 'Halal Verification',
    description: 'Check food additives and ingredients for common halal concerns.',
    h1: 'Halal Verification',
    body: 'Look up E-numbers and product ingredients for guidance.',
  },
  fatawa: {
    title: 'Fatawa Search',
    description: 'Search Islamic rulings and scholarly answers by topic.',
    h1: 'Fatawa Search',
    body: 'Find referenced answers from recognized scholarly sources.',
  },
  moon_sighting: {
    title: 'Moon Sighting',
    description: 'Information about Islamic month starts and moon sighting.',
    h1: 'Moon Sighting',
    body: 'Follow lunar month beginnings for Ramadan and Eid.',
  },
  inheritance: {
    title: 'Islamic Inheritance Calculator',
    description: 'Estimate Quranic inheritance shares according to Islamic law.',
    h1: 'Inheritance Calculator',
    body: 'Compute faraid shares for heirs based on classical rules.',
  },
  islamic_library: {
    title: 'Islamic Library',
    description: 'Curated Islamic reading and reference resources.',
    h1: 'Islamic Library',
    body: 'Browse books and references for study.',
  },
  settings: {
    title: 'Settings',
    description: 'Manage language, theme, location, and notification preferences.',
    h1: 'Settings',
    body: 'Personalize your Islam app experience.',
  },
  share: {
    title: 'Share Card',
    description: 'Create a shareable card from Quran, hadith, or dua.',
    h1: 'Share',
    body: 'Export a simple image to share authentic content.',
  },
  welcome: {
    title: 'Welcome',
    description: 'Get started with Islam: set language, location, and preferences.',
    h1: 'Welcome',
    body: 'Onboarding for first-time visitors.',
  },
  search: {
    title: 'Search',
    description: 'Search Quran, hadith, and tools across Islam.',
    h1: 'Search',
    body: 'Find surahs, hadith, and features quickly.',
  },
  not_found: {
    title: 'Page Not Found',
    description: 'The requested page does not exist on islam.house.',
    h1: 'Page not found',
    body: 'Return home or browse Quran, prayer times, and hadith.',
  },
}

const AR: Partial<Record<StaticRouteKey, PageSeoCopy>> = {
  home: {
    title: 'إسلام، ممارسة يومية راسخة',
    description: 'مواقيت صلاة دقيقة، القرآن كاملاً، أحاديث موثقة، وأدعية يومية، بمصادر شفافة ومجانية.',
    h1: 'إسلام، ممارسة يومية راسخة',
    body: 'مواقيت الصلاة والقرآن والحديث والأدعية والقبلة والزكاة وغيرها. بلا إعلانات ومصادر موثوقة.',
  },
  prayer_times: {
    title: 'مواقيت الصلاة',
    description: 'مواقيت الصلوات اليومية بدقة حسب موقعك مع طرق الحساب والجدول الشهري.',
    h1: 'مواقيت الصلاة',
    body: 'الفجر والظهر والعصر والمغرب والعشاء لمدينتك.',
  },
  quran: {
    title: 'القرآن الكريم',
    description: 'اقرأ القرآن كاملاً مع النص العربي والترجمة والصوت.',
    h1: 'القرآن الكريم',
    body: 'تصفح السور والأجزاء. اقرأ واستمع وتدبر.',
  },
  hadith: {
    title: 'مجموعات الحديث',
    description: 'أحاديث موثقة من البخاري ومسلم وأبي داود والترمذي والنسائي وابن ماجه وغيرها.',
    h1: 'مجموعات الحديث',
    body: 'ابحث واقرأ الأحاديث مع درجاتها.',
  },
  qibla: {
    title: 'اتجاه القبلة',
    description: 'اعرف اتجاه الكعبة من موقعك مع دعم البوصلة.',
    h1: 'اتجاه القبلة',
    body: 'اتجاه مكة المكرمة من موقعك الحالي.',
  },
  duas: {
    title: 'الأدعية والأذكار',
    description: 'أدعية وأذكار يومية بالعربية مع الترجمة.',
    h1: 'الأدعية والأذكار',
    body: 'أدعية الصباح والمساء والمناسبات من مصادر موثوقة.',
  },
  tafsir: {
    title: 'التفسير',
    description: 'تفسير القرآن حسب السورة والآية من تفاسير معتمدة.',
    h1: 'التفسير',
    body: 'استكشف التفاسير لكل سور القرآن.',
  },
  zakat: {
    title: 'حاسبة الزكاة',
    description: 'احسب الزكاة الواجبة وزكاة الفطر.',
    h1: 'حاسبة الزكاة',
    body: 'قدّر الزكاة المستحقة على مالك.',
  },
  not_found: {
    title: 'الصفحة غير موجودة',
    description: 'الصفحة المطلوبة غير موجودة في islam.house.',
    h1: 'الصفحة غير موجودة',
    body: 'عد إلى الصفحة الرئيسية أو تصفح القرآن ومواقيت الصلاة.',
  },
}

const UR: Partial<Record<StaticRouteKey, PageSeoCopy>> = {
  home: {
    title: 'اسلام، روزمرہ عبادت',
    description: 'درست نماز کے اوقات، مکمل قرآن، مستند احادیث اور دعائیں، شفاف ذرائع کے ساتھ مفت۔',
    h1: 'اسلام، روزمرہ عبادت',
    body: 'نماز کے اوقات، قرآن، حدیث، دعائیں، قبلہ اور زکوٰۃ۔ بغیر اشتہارات۔',
  },
  prayer_times: {
    title: 'نماز کے اوقات',
    description: 'آپ کے مقام کے مطابق درست روزانہ نماز کے اوقات۔',
    h1: 'نماز کے اوقات',
    body: 'فجر، ظہر، عصر، مغرب اور عشاء آپ کے شہر کے لیے۔',
  },
  quran: {
    title: 'قرآن مجید',
    description: 'تمام ۱۱۴ سورتیں عربی متن، ترجمہ اور آڈیو کے ساتھ پڑھیں۔',
    h1: 'قرآن مجید',
    body: 'سورتیں اور پارے دیکھیں۔ پڑھیں، سنیں اور غور کریں۔',
  },
  hadith: {
    title: 'حدیث کے مجموعے',
    description: 'بخاری، مسلم اور دیگر مستند مجموعوں سے احادیث۔',
    h1: 'حدیث کے مجموعے',
    body: 'درجہ بندی کے ساتھ احادیث تلاش کریں اور پڑھیں۔',
  },
  not_found: {
    title: 'صفحہ نہیں ملا',
    description: 'درخواست کردہ صفحہ موجود نہیں۔',
    h1: 'صفحہ نہیں ملا',
    body: 'ہوم پر واپس جائیں یا قرآن اور نماز دیکھیں۔',
  },
}

const ID: Partial<Record<StaticRouteKey, PageSeoCopy>> = {
  home: {
    title: 'Islam, Praktik Harian yang Kokoh',
    description:
      'Jadwal sholat akurat, Al-Quran lengkap, hadits terverifikasi, dan doa harian, bersumber transparan dan gratis.',
    h1: 'Islam, Praktik Harian yang Kokoh',
    body: 'Jadwal sholat, Quran, hadits, doa, kiblat, dan zakat. Tanpa iklan dan transparan sumbernya.',
  },
  prayer_times: {
    title: 'Jadwal Sholat',
    description: 'Waktu sholat harian akurat untuk lokasi Anda.',
    h1: 'Jadwal Sholat',
    body: 'Subuh, Zuhur, Asar, Magrib, dan Isya untuk kota Anda.',
  },
  quran: {
    title: 'Al-Quran',
    description: 'Baca 114 surah Al-Quran dengan teks Arab, terjemahan, dan audio.',
    h1: 'Al-Quran',
    body: 'Jelajahi surah dan juz. Baca, dengarkan, dan renungkan.',
  },
  hadith: {
    title: 'Koleksi Hadits',
    description: 'Hadits autentik dari Bukhari, Muslim, dan koleksi utama lainnya.',
    h1: 'Koleksi Hadits',
    body: 'Cari dan baca hadits dengan penilaian.',
  },
  not_found: {
    title: 'Halaman Tidak Ditemukan',
    description: 'Halaman yang diminta tidak ada di islam.house.',
    h1: 'Halaman tidak ditemukan',
    body: 'Kembali ke beranda atau jelajahi Quran dan jadwal sholat.',
  },
}

const FR: Partial<Record<StaticRouteKey, PageSeoCopy>> = {
  home: {
    title: 'Islam, pratique quotidienne ancrée',
    description:
      'Horaires de prière précis, Coran complet, hadiths authentifiés et invocations quotidiennes, sources transparentes et gratuites.',
    h1: 'Islam, pratique quotidienne ancrée',
    body: 'Prières, Coran, hadiths, duas, qibla et zakat. Sans publicité, sources transparentes.',
  },
  prayer_times: {
    title: 'Horaires de prière',
    description: 'Horaires de salat précis selon votre position.',
    h1: 'Horaires de prière',
    body: 'Fajr, Dhuhr, Asr, Maghrib et Isha pour votre ville.',
  },
  quran: {
    title: 'Le Saint Coran',
    description: 'Lisez les 114 sourates avec texte arabe, traduction et audio.',
    h1: 'Le Saint Coran',
    body: 'Parcourez les sourates et les juz. Lisez, écoutez et méditez.',
  },
  hadith: {
    title: 'Collections de hadiths',
    description: 'Hadiths authentifiés de Bukhari, Muslim et d\'autres collections majeures.',
    h1: 'Collections de hadiths',
    body: 'Recherchez et lisez des hadiths avec classification.',
  },
  not_found: {
    title: 'Page introuvable',
    description: 'La page demandée n\'existe pas sur islam.house.',
    h1: 'Page introuvable',
    body: 'Retournez à l\'accueil ou consultez le Coran et les horaires de prière.',
  },
}

const BY_LOCALE: Record<LocaleCode, Partial<Record<StaticRouteKey, PageSeoCopy>>> = {
  en: EN,
  ar: AR,
  ur: UR,
  id: ID,
  fr: FR,
}

/** Path without locale prefix → static SEO key. */
export const STATIC_PATH_TO_KEY: Record<string, StaticRouteKey> = {
  '/': 'home',
  '/get_app': 'get_app',
  '/sources': 'sources',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/prayer_times': 'prayer_times',
  '/adhan': 'adhan',
  '/islamic_radio': 'islamic_radio',
  '/qibla': 'qibla',
  '/quran': 'quran',
  '/hadith': 'hadith',
  '/duas': 'duas',
  '/tafsir': 'tafsir',
  '/ramadan': 'ramadan',
  '/zakat': 'zakat',
  '/tasbeeh': 'tasbeeh',
  '/names': 'names',
  '/shahada': 'shahada',
  '/live': 'live',
  '/hajj': 'hajj',
  '/baby_names': 'baby_names',
  '/hijri_calendar': 'hijri_calendar',
  '/events': 'events',
  '/mosque_finder': 'mosque_finder',
  '/halal_verification': 'halal_verification',
  '/fatawa': 'fatawa',
  '/moon_sighting': 'moon_sighting',
  '/inheritance': 'inheritance',
  '/islamic_library': 'islamic_library',
  '/settings': 'settings',
  '/share': 'share',
  '/welcome': 'welcome',
  '/search': 'search',
}

export const NOINDEX_PATHS = new Set([
  '/settings',
  '/share',
  '/welcome',
  '/search',
  '/onboarding',
])

export const INDEXABLE_STATIC_PATHS = Object.keys(STATIC_PATH_TO_KEY).filter(
  (p) => p !== '/' && !NOINDEX_PATHS.has(p),
)

export function getStaticPageCopy(key: StaticRouteKey, locale: LocaleCode): PageSeoCopy {
  return BY_LOCALE[locale][key] ?? EN[key]
}

export function getStaticCopyForPath(pathWithoutLocale: string, locale: LocaleCode): PageSeoCopy | null {
  const key = STATIC_PATH_TO_KEY[pathWithoutLocale]
  if (!key) return null
  return getStaticPageCopy(key, locale)
}
