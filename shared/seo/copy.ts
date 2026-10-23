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
  | 'embed_prayer_times'
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
    title: 'Sources and Methodology',
    description:
      'Transparent list of Quran, hadith, prayer time sources and the islam.house methodology.',
    h1: 'Sources and Methodology',
    body: 'Every feature cites its upstream sources so you can verify authenticity. Brand: islam.house.',
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
  embed_prayer_times: {
    title: 'Prayer Times Embed',
    description: 'Embeddable prayer times widget for mosque and community sites.',
    h1: 'Prayer times embed',
    body: 'Minimal iframe widget. Link back to islam.house for the full app.',
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
  sources: {
    title: 'المصادر والمنهجية',
    description: 'قائمة شفافة بمصادر القرآن والحديث ومواقيت الصلاة ومنهجية islam.house.',
    h1: 'المصادر والمنهجية',
    body: 'كل ميزة تذكر مصدرها العلني للتحقق.',
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
  mosque_finder: {
    title: 'البحث عن المساجد',
    description: 'اعثر على المساجد القريبة على الخريطة ببيانات جغرافية مفتوحة.',
    h1: 'البحث عن المساجد',
    body: 'حدد المساجد قرب موقعك الحالي.',
  },
  halal_verification: {
    title: 'التحقق من الحلال',
    description: 'تحقق من المواد المضافة والمكونات للشواغل الشائعة حول الحلال.',
    h1: 'التحقق من الحلال',
    body: 'ابحث عن أرقام E ومكونات المنتجات للتوجيه.',
  },
  inheritance: {
    title: 'حاسبة الميراث الإسلامي',
    description: 'قدّر أنصبة الميراث القرآنية وفق أحكام الشريعة.',
    h1: 'حاسبة الميراث',
    body: 'احسب أنصبة الورثة وفق القواعد الكلاسيكية.',
  },
  baby_names: {
    title: 'أسماء إسلامية للأطفال',
    description: 'تصفح أسماء إسلامية بمعانيها للأولاد والبنات.',
    h1: 'أسماء إسلامية للأطفال',
    body: 'ابحث عن أسماء ذات معنى من التراث العربي.',
  },
  ramadan: {
    title: 'مركز رمضان',
    description: 'أوقات السحور والإفطار وتقويم رمضان وأدعية الصيام.',
    h1: 'مركز رمضان',
    body: 'العد التنازلي وجدول الصيام وأدعية رمضان.',
  },
  hajj: {
    title: 'دليل الحج والعمرة',
    description: 'إرشاد عملي لمناسك الحج والعمرة والاستعداد.',
    h1: 'الحج والعمرة',
    body: 'الخطوات والأدعية والأساسيات للرحلة.',
  },
  names: {
    title: 'أسماء الله الحسنى',
    description: 'تعرّف على الأسماء الحسنى مع المعنى والنطق.',
    h1: 'أسماء الله الحسنى',
    body: 'الأسماء الحسنى مع النقل الحرفي ومعانٍ موجزة.',
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
  sources: {
    title: 'ماخذ اور طریقہ کار',
    description: 'قرآن، حدیث، نماز کے اوقات کے شفاف ماخذ اور islam.house کا طریقہ کار۔',
    h1: 'ماخذ اور طریقہ کار',
    body: 'ہر فیچر اپنے ماخذ کی وضاحت کرتا ہے۔',
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
  qibla: {
    title: 'قبلہ کی سمت',
    description: 'اپنے مقام سے کعبہ کی سمت معلوم کریں۔',
    h1: 'قبلہ کی سمت',
    body: 'مکہ مکرمہ کی سمت آپ کے موجودہ مقام سے۔',
  },
  duas: {
    title: 'دعائیں اور اذکار',
    description: 'روزمرہ اسلامی دعائیں عربی اور ترجمہ کے ساتھ۔',
    h1: 'دعائیں اور اذکار',
    body: 'صبح، شام اور مواقع کی دعائیں مستند مصادر سے۔',
  },
  zakat: {
    title: 'زکوٰۃ کیلکولیٹر',
    description: 'واجب زکوٰۃ اور فطرانہ کا حساب لگائیں۔',
    h1: 'زکوٰۃ کیلکولیٹر',
    body: 'مال پر واجب زکوٰۃ کا تخمینہ۔',
  },
  mosque_finder: {
    title: 'مسجد تلاش',
    description: 'نقشے پر قریبی مساجد تلاش کریں۔',
    h1: 'مسجد تلاش',
    body: 'اپنے مقام کے قریب مساجد معلوم کریں۔',
  },
  halal_verification: {
    title: 'حلال تصدیق',
    description: 'اضافی اجزا اور اجزاء کی حلال رہنمائی۔',
    h1: 'حلال تصدیق',
    body: 'E نمبرز اور مصنوعات کے اجزاء دیکھیں۔',
  },
  inheritance: {
    title: 'اسلامی وراثت کیلکولیٹر',
    description: 'قرآنی وراثت کے حصوں کا تخمینہ۔',
    h1: 'وراثت کیلکولیٹر',
    body: 'کلاسیکی قواعد کے مطابق حصے حساب کریں۔',
  },
  baby_names: {
    title: 'اسلامی بچوں کے نام',
    description: 'معنی کے ساتھ لڑکوں اور لڑکیوں کے اسلامی نام۔',
    h1: 'اسلامی بچوں کے نام',
    body: 'عربی روایت سے بامعنی نام تلاش کریں۔',
  },
  ramadan: {
    title: 'رمضان مرکز',
    description: 'سحری، افطار، رمضان کیلنڈر اور روزے کی دعائیں۔',
    h1: 'رمضان مرکز',
    body: 'شمارِ معکوس، روزہ شیڈول اور رمضان دعائیں۔',
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
  sources: {
    title: 'Sumber dan Metodologi',
    description: 'Daftar transparan sumber Quran, hadits, jadwal sholat, dan metodologi islam.house.',
    h1: 'Sumber dan Metodologi',
    body: 'Setiap fitur mencantumkan sumber hulu untuk diverifikasi.',
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
  qibla: {
    title: 'Arah Kiblat',
    description: 'Temukan arah Ka\'bah dari lokasi Anda dengan kompas.',
    h1: 'Arah Kiblat',
    body: 'Arah Makkah dari lokasi Anda saat ini.',
  },
  duas: {
    title: 'Doa dan Dzikir',
    description: 'Doa harian Islam dengan Arab dan terjemahan.',
    h1: 'Doa dan Dzikir',
    body: 'Doa pagi, sore, dan situasional dari sumber autentik.',
  },
  zakat: {
    title: 'Kalkulator Zakat',
    description: 'Hitung zakat wajib dan zakat fitrah.',
    h1: 'Kalkulator Zakat',
    body: 'Perkiraan zakat atas harta Anda.',
  },
  mosque_finder: {
    title: 'Pencari Masjid',
    description: 'Temukan masjid terdekat di peta dengan data geografis terbuka.',
    h1: 'Pencari Masjid',
    body: 'Lokasi masjid dekat Anda.',
  },
  halal_verification: {
    title: 'Verifikasi Halal',
    description: 'Periksa bahan tambahan untuk pedoman halal umum.',
    h1: 'Verifikasi Halal',
    body: 'Cari nomor E dan bahan produk.',
  },
  inheritance: {
    title: 'Kalkulator Warisan Islam',
    description: 'Perkiraan bagian warisan Quran sesuai hukum Islam.',
    h1: 'Kalkulator Warisan',
    body: 'Hitung bagian ahli waris menurut aturan klasik.',
  },
  baby_names: {
    title: 'Nama Bayi Islam',
    description: 'Jelajahi nama bayi Islam beserta artinya.',
    h1: 'Nama Bayi Islam',
    body: 'Cari nama bermakna dari tradisi Arab.',
  },
  ramadan: {
    title: 'Pusat Ramadan',
    description: 'Sahur, berbuka, kalender Ramadan, dan doa puasa.',
    h1: 'Pusat Ramadan',
    body: 'Hitungan mundur, jadwal puasa, dan doa Ramadan.',
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
  sources: {
    title: 'Sources et méthodologie',
    description: 'Liste transparente des sources Coran, hadiths, horaires et méthodologie islam.house.',
    h1: 'Sources et méthodologie',
    body: 'Chaque fonction cite sa source pour vérification.',
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
  qibla: {
    title: 'Direction de la qibla',
    description: 'Trouvez la direction de la Kaaba depuis votre position.',
    h1: 'Direction de la qibla',
    body: 'Cap vers La Mecque depuis votre position actuelle.',
  },
  duas: {
    title: 'Duas et adhkars',
    description: 'Invocations quotidiennes en arabe avec traduction.',
    h1: 'Duas et adhkars',
    body: 'Invocations du matin, du soir et situationnelles.',
  },
  zakat: {
    title: 'Calculateur de zakat',
    description: 'Calculez la zakat obligatoire et la zakat al-fitr.',
    h1: 'Calculateur de zakat',
    body: 'Estimez la zakat due sur vos biens.',
  },
  mosque_finder: {
    title: 'Trouver une mosquée',
    description: 'Trouvez les mosquées proches sur une carte ouverte.',
    h1: 'Trouver une mosquée',
    body: 'Localisez les masajid près de vous.',
  },
  halal_verification: {
    title: 'Vérification halal',
    description: 'Vérifiez additifs et ingrédients pour les questions halal courantes.',
    h1: 'Vérification halal',
    body: 'Recherchez les numéros E et les ingrédients.',
  },
  inheritance: {
    title: 'Calculateur d\'héritage islamique',
    description: 'Estimez les parts d\'héritage coraniques.',
    h1: 'Calculateur d\'héritage',
    body: 'Calculez les parts selon les règles classiques.',
  },
  baby_names: {
    title: 'Prénoms islamiques',
    description: 'Parcourez des prénoms islamiques avec leurs sens.',
    h1: 'Prénoms islamiques',
    body: 'Cherchez des noms significatifs de la tradition arabe.',
  },
  ramadan: {
    title: 'Hub Ramadan',
    description: 'Suhoor, iftar, calendrier de Ramadan et duas de jeûne.',
    h1: 'Hub Ramadan',
    body: 'Compte à rebours, calendrier de jeûne et duas de Ramadan.',
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
  '/embed/prayer_times': 'embed_prayer_times',
}

export const NOINDEX_PATHS = new Set([
  '/settings',
  '/share',
  '/welcome',
  '/search',
  '/onboarding',
  '/embed/prayer_times',
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
