import {
  getStaticCopyForPath,
  getStaticPageCopy,
  NOINDEX_PATHS,
  type PageSeoCopy,
} from './copy.ts'
import { getCityBySlug, isCitySlug, qiblaBearingDegrees, type SeoCity } from './cities.ts'
import { getHadithCollectionMeta, isHadithCollectionId, isSafeHadithSeoId } from './hadith.ts'
import {
  absoluteUrl,
  getLanguageDirection,
  hreflangAlternates,
  localizedPath,
  parseLocalePath,
  SITE_URL,
  type LocaleCode,
  type HreflangAlternate,
} from './locale.ts'
import { getSurah, type SurahMeta } from './surahs.ts'

export const DUA_CATEGORY_IDS = [
  'morning',
  'evening',
  'after_prayer',
  'sleep',
  'food',
  'travel',
  'wudu',
  'mosque',
  'home',
  'protection',
  'distress',
  'forgiveness',
  'ramadan',
] as const

export type DuaCategoryId = (typeof DUA_CATEGORY_IDS)[number]

export type SeoKind =
  | 'static'
  | 'surah'
  | 'tafsir_surah'
  | 'hadith_collection'
  | 'hadith_books'
  | 'hadith_book'
  | 'hadith_entry'
  | 'prayer_city'
  | 'qibla_city'
  | 'ramadan_city'
  | 'dua_category'
  | 'not_found'

export interface SeoBreadcrumb {
  name: string
  path: string
}

export interface ResolvedSeo {
  kind: SeoKind
  locale: LocaleCode
  /** Path without locale prefix */
  pathWithoutLocale: string
  /** Full path including locale prefix */
  canonicalPath: string
  canonicalUrl: string
  title: string
  description: string
  h1: string
  body: string
  noIndex: boolean
  status: 200 | 404
  dir: 'rtl' | 'ltr'
  alternates: HreflangAlternate[]
  breadcrumbs: SeoBreadcrumb[]
  surah?: SurahMeta
  hadithCollectionId?: string
  hadithId?: string
  bookNumber?: string
  city?: SeoCity
  duaCategoryId?: string
  /** Extra ayah / hadith text injected after fetch */
  richText?: string
  dateModified?: string
}

function titleWithBrand(title: string): string {
  if (title.includes('islam.house') || title.includes('Islam')) return title
  return `${title} | islam.house`
}

function surahCopy(surah: SurahMeta, locale: LocaleCode, mode: 'quran' | 'tafsir'): PageSeoCopy {
  const isTafsir = mode === 'tafsir'
  const revAr = surah.revelation === 'Meccan' ? 'مكية' : 'مدنية'
  if (locale === 'ar') {
    return {
      title: isTafsir
        ? `تفسير سورة ${surah.nameArabic}`
        : `سورة ${surah.nameArabic} · ${surah.nameLatin}`,
      description: isTafsir
        ? `تفسير سورة ${surah.nameArabic} (${surah.nameLatin})، ${surah.ayahs} آيات، ${revAr}.`
        : `سورة ${surah.nameArabic} (${surah.translationEn})، ${surah.ayahs} آيات، ${revAr}. اقرأ النص العربي والترجمة.`,
      h1: isTafsir ? `تفسير سورة ${surah.nameArabic}` : `سورة ${surah.nameArabic}`,
      body: `${surah.nameLatin} · ${surah.translationEn} · ${surah.ayahs} آيات`,
    }
  }
  if (locale === 'fr') {
    const prefix = isTafsir ? 'Tafsir de ' : 'Sourate '
    return {
      title: `${prefix}${surah.nameLatin} (${surah.nameArabic})`,
      description: `${prefix}${surah.nameLatin}, ${surah.translationEn}. ${surah.ayahs} versets, ${surah.revelation}. Texte arabe et traduction sur islam.house.`,
      h1: `${prefix}${surah.nameLatin}`,
      body: `${surah.nameArabic} · ${surah.translationEn} · ${surah.ayahs} versets · ${surah.revelation}`,
    }
  }
  if (locale === 'id') {
    const prefix = isTafsir ? 'Tafsir ' : 'Surah '
    return {
      title: `${prefix}${surah.nameLatin} (${surah.nameArabic})`,
      description: `${prefix}${surah.nameLatin}, ${surah.translationEn}. ${surah.ayahs} ayat, ${surah.revelation}. Baca teks Arab dan terjemahan di islam.house.`,
      h1: `${prefix}${surah.nameLatin}`,
      body: `${surah.nameArabic} · ${surah.translationEn} · ${surah.ayahs} ayat · ${surah.revelation}`,
    }
  }
  if (locale === 'ur') {
    const prefix = isTafsir ? 'تفسیر ' : 'سورۃ '
    return {
      title: `${prefix}${surah.nameLatin} (${surah.nameArabic})`,
      description: `${prefix}${surah.nameLatin}، ${surah.translationEn}. ${surah.ayahs} آیات، ${surah.revelation}. عربی متن اور ترجمہ islam.house پر پڑھیں۔`,
      h1: `${prefix}${surah.nameLatin}`,
      body: `${surah.nameArabic} · ${surah.translationEn} · ${surah.ayahs} آیات · ${surah.revelation}`,
    }
  }
  const prefix = isTafsir ? 'Tafsir of ' : 'Surah '
  return {
    title: `${prefix}${surah.nameLatin} (${surah.nameArabic})`,
    description: `${prefix}${surah.nameLatin}, ${surah.translationEn}. ${surah.ayahs} ayahs, ${surah.revelation}. Read Arabic text and translation on islam.house.`,
    h1: `${prefix}${surah.nameLatin}`,
    body: `${surah.nameArabic} · ${surah.translationEn} · ${surah.ayahs} verses · ${surah.revelation}`,
  }
}

function hadithCollectionCopy(id: string, locale: LocaleCode): PageSeoCopy {
  const meta = getHadithCollectionMeta(id)
  const name = meta?.name ?? id
  const desc = meta?.description ?? 'Authenticated hadith collection'
  if (locale === 'ar') {
    return {
      title: name,
      description: `${desc}. اقرأ الأحاديث على islam.house.`,
      h1: name,
      body: desc,
    }
  }
  if (locale === 'fr') {
    return {
      title: name,
      description: `${desc}. Consultez les hadiths classés sur islam.house.`,
      h1: name,
      body: desc,
    }
  }
  if (locale === 'id') {
    return {
      title: name,
      description: `${desc}. Baca hadits dengan penilaian di islam.house.`,
      h1: name,
      body: desc,
    }
  }
  if (locale === 'ur') {
    return {
      title: name,
      description: `${desc}. islam.house پر درجہ بند احادیث پڑھیں۔`,
      h1: name,
      body: desc,
    }
  }
  return {
    title: name,
    description: `${desc}. Browse graded hadith on islam.house.`,
    h1: name,
    body: desc,
  }
}

function hadithEntryCopy(name: string, hadithId: string, locale: LocaleCode): PageSeoCopy {
  if (locale === 'ar') {
    return {
      title: `حديث ${hadithId}، ${name}`,
      description: `اقرأ الحديث ${hadithId} من ${name} بالعربية والترجمة.`,
      h1: `${name}، حديث ${hadithId}`,
      body: `حديث موثق من ${name}.`,
    }
  }
  if (locale === 'fr') {
    return {
      title: `Hadith ${hadithId}, ${name}`,
      description: `Lisez le hadith ${hadithId} de ${name} en arabe et en traduction.`,
      h1: `${name}, Hadith ${hadithId}`,
      body: `Hadith authentifié de ${name}.`,
    }
  }
  if (locale === 'id') {
    return {
      title: `Hadits ${hadithId}, ${name}`,
      description: `Baca hadits ${hadithId} dari ${name} dengan Arab dan terjemahan.`,
      h1: `${name}, Hadits ${hadithId}`,
      body: `Hadits autentik dari ${name}.`,
    }
  }
  if (locale === 'ur') {
    return {
      title: `حدیث ${hadithId}، ${name}`,
      description: `${name} سے حدیث ${hadithId} عربی اور ترجمہ کے ساتھ پڑھیں۔`,
      h1: `${name}، حدیث ${hadithId}`,
      body: `${name} سے مستند حدیث۔`,
    }
  }
  return {
    title: `Hadith ${hadithId}, ${name}`,
    description: `Read hadith ${hadithId} from ${name} with Arabic and translation.`,
    h1: `${name}, Hadith ${hadithId}`,
    body: `Authenticated hadith from ${name}.`,
  }
}

function cityPrayerCopy(city: SeoCity, locale: LocaleCode): PageSeoCopy {
  if (locale === 'ar') {
    return {
      title: `مواقيت الصلاة في ${city.nameEn}`,
      description: `مواقيت الصلوات اليومية في ${city.nameEn} (${city.country}) مع جدول شهري واتجاه القبلة.`,
      h1: `مواقيت الصلاة في ${city.nameEn}`,
      body: `فجر وظهر وعصر ومغرب وعشاء لـ ${city.nameEn}.`,
    }
  }
  if (locale === 'fr') {
    return {
      title: `Horaires de prière à ${city.nameEn}`,
      description: `Horaires de salat quotidiens à ${city.nameEn} (${city.country}), calendrier mensuel et qibla.`,
      h1: `Horaires de prière à ${city.nameEn}`,
      body: `Fajr, Dhuhr, Asr, Maghrib et Isha pour ${city.nameEn}.`,
    }
  }
  if (locale === 'id') {
    return {
      title: `Jadwal sholat ${city.nameEn}`,
      description: `Waktu sholat harian di ${city.nameEn} (${city.country}), jadwal bulanan, dan kiblat.`,
      h1: `Jadwal sholat ${city.nameEn}`,
      body: `Subuh, Zuhur, Asar, Magrib, dan Isya untuk ${city.nameEn}.`,
    }
  }
  if (locale === 'ur') {
    return {
      title: `${city.nameEn} میں نماز کے اوقات`,
      description: `${city.nameEn} (${city.country}) کے روزانہ نماز کے اوقات، ماہانہ شیڈول اور قبلہ۔`,
      h1: `${city.nameEn} میں نماز کے اوقات`,
      body: `${city.nameEn} کے لیے فجر، ظہر، عصر، مغرب اور عشاء۔`,
    }
  }
  return {
    title: `Prayer times in ${city.nameEn}`,
    description: `Daily salah times for ${city.nameEn} (${city.country}) with monthly schedule and qibla direction.`,
    h1: `Prayer times in ${city.nameEn}`,
    body: `Fajr, Dhuhr, Asr, Maghrib, and Isha for ${city.nameEn}.`,
  }
}

function cityQiblaCopy(city: SeoCity, locale: LocaleCode, bearing: number): PageSeoCopy {
  const deg = Math.round(bearing)
  if (locale === 'ar') {
    return {
      title: `اتجاه القبلة من ${city.nameEn}`,
      description: `اتجاه الكعبة من ${city.nameEn}: حوالي ${deg} درجة من الشمال.`,
      h1: `القبلة من ${city.nameEn}`,
      body: `الاتجاه التقريبي إلى مكة من ${city.nameEn} هو ${deg}°.`,
    }
  }
  if (locale === 'fr') {
    return {
      title: `Qibla depuis ${city.nameEn}`,
      description: `Direction de la Kaaba depuis ${city.nameEn}: environ ${deg}° depuis le nord.`,
      h1: `Qibla depuis ${city.nameEn}`,
      body: `Cap approximatif vers La Mecque depuis ${city.nameEn}: ${deg}°.`,
    }
  }
  if (locale === 'id') {
    return {
      title: `Arah kiblat dari ${city.nameEn}`,
      description: `Arah Ka'bah dari ${city.nameEn}: sekitar ${deg}° dari utara.`,
      h1: `Kiblat dari ${city.nameEn}`,
      body: `Arah perkiraan ke Makkah dari ${city.nameEn}: ${deg}°.`,
    }
  }
  if (locale === 'ur') {
    return {
      title: `${city.nameEn} سے قبلہ کی سمت`,
      description: `${city.nameEn} سے کعبہ کی سمت: تقریباً ${deg}° شمال سے۔`,
      h1: `${city.nameEn} سے قبلہ`,
      body: `${city.nameEn} سے مکہ کی تقریبی سمت ${deg}° ہے۔`,
    }
  }
  return {
    title: `Qibla direction from ${city.nameEn}`,
    description: `Kaaba bearing from ${city.nameEn}: about ${deg}° from true north.`,
    h1: `Qibla from ${city.nameEn}`,
    body: `Approximate bearing to Makkah from ${city.nameEn} is ${deg}°.`,
  }
}

function cityRamadanCopy(city: SeoCity, year: number, locale: LocaleCode): PageSeoCopy {
  if (locale === 'ar') {
    return {
      title: `رمضان ${year} في ${city.nameEn}`,
      description: `أوقات السحور والإفطار لرمضان ${year} في ${city.nameEn}.`,
      h1: `رمضان ${year}، ${city.nameEn}`,
      body: `جدول الصيام لـ ${city.nameEn} في ${year}.`,
    }
  }
  if (locale === 'fr') {
    return {
      title: `Ramadan ${year} à ${city.nameEn}`,
      description: `Horaires de suhoor et iftar pour Ramadan ${year} à ${city.nameEn}.`,
      h1: `Ramadan ${year}, ${city.nameEn}`,
      body: `Calendrier de jeûne pour ${city.nameEn} en ${year}.`,
    }
  }
  if (locale === 'id') {
    return {
      title: `Ramadan ${year} di ${city.nameEn}`,
      description: `Jadwal sahur dan berbuka Ramadan ${year} di ${city.nameEn}.`,
      h1: `Ramadan ${year}, ${city.nameEn}`,
      body: `Kalender puasa untuk ${city.nameEn} tahun ${year}.`,
    }
  }
  if (locale === 'ur') {
    return {
      title: `${city.nameEn} میں رمضان ${year}`,
      description: `${city.nameEn} میں رمضان ${year} کے سحری اور افطار کے اوقات۔`,
      h1: `رمضان ${year}، ${city.nameEn}`,
      body: `${year} میں ${city.nameEn} کا روزہ شیڈول۔`,
    }
  }
  return {
    title: `Ramadan ${year} in ${city.nameEn}`,
    description: `Suhoor and iftar times for Ramadan ${year} in ${city.nameEn}.`,
    h1: `Ramadan ${year}, ${city.nameEn}`,
    body: `Fasting schedule for ${city.nameEn} in ${year}.`,
  }
}

const DUA_CATEGORY_LABELS: Record<
  DuaCategoryId,
  Record<LocaleCode, { name: string; description: string }>
> = {
  morning: {
    en: { name: 'Morning Adhkar', description: 'Morning remembrances with Arabic, transliteration, and translation.' },
    ar: { name: 'أذكار الصباح', description: 'أذكار الصباح بالعربية مع الترجمة والنقل الحرفي.' },
    fr: { name: 'Adhkars du matin', description: 'Invocations du matin en arabe, translittération et traduction.' },
    id: { name: 'Dzikir pagi', description: 'Dzikir pagi dengan Arab, transliterasi, dan terjemahan.' },
    ur: { name: 'صبح کے اذکار', description: 'صبح کے اذکار عربی، نقل حرفی اور ترجمہ کے ساتھ۔' },
  },
  evening: {
    en: { name: 'Evening Adhkar', description: 'Evening remembrances with Arabic and translation.' },
    ar: { name: 'أذكار المساء', description: 'أذكار المساء بالعربية مع الترجمة.' },
    fr: { name: 'Adhkars du soir', description: 'Invocations du soir en arabe et traduction.' },
    id: { name: 'Dzikir sore', description: 'Dzikir sore dengan Arab dan terjemahan.' },
    ur: { name: 'شام کے اذکار', description: 'شام کے اذکار عربی اور ترجمہ کے ساتھ۔' },
  },
  after_prayer: {
    en: { name: 'After Prayer Duas', description: 'Supplications after salah with sources.' },
    ar: { name: 'أذكار بعد الصلاة', description: 'أدعية بعد الصلاة مع مصادرها.' },
    fr: { name: 'Après la prière', description: 'Invocations après la salat avec sources.' },
    id: { name: 'Setelah sholat', description: 'Doa setelah sholat beserta sumbernya.' },
    ur: { name: 'نماز کے بعد', description: 'نماز کے بعد کی دعائیں مصادر کے ساتھ۔' },
  },
  sleep: {
    en: { name: 'Sleep Duas', description: 'Duas before sleep from authentic sources.' },
    ar: { name: 'أذكار النوم', description: 'أدعية قبل النوم من مصادر موثوقة.' },
    fr: { name: 'Duas du sommeil', description: 'Invocations avant de dormir, sources authentiques.' },
    id: { name: 'Doa tidur', description: 'Doa sebelum tidur dari sumber autentik.' },
    ur: { name: 'نیند کی دعائیں', description: 'سونے سے پہلے کی مستند دعائیں۔' },
  },
  food: {
    en: { name: 'Food Duas', description: 'Duas before and after eating.' },
    ar: { name: 'أذكار الطعام', description: 'أدعية قبل الطعام وبعده.' },
    fr: { name: 'Duas alimentaires', description: 'Invocations avant et après le repas.' },
    id: { name: 'Doa makan', description: 'Doa sebelum dan sesudah makan.' },
    ur: { name: 'کھانے کی دعائیں', description: 'کھانے سے پہلے اور بعد کی دعائیں۔' },
  },
  travel: {
    en: { name: 'Travel Duas', description: 'Supplications for journeys and travel safety.' },
    ar: { name: 'أذكار السفر', description: 'أدعية السفر وسلامة الطريق.' },
    fr: { name: 'Duas de voyage', description: 'Invocations pour les voyages et la sécurité.' },
    id: { name: 'Doa perjalanan', description: 'Doa untuk perjalanan dan keselamatan.' },
    ur: { name: 'سفر کی دعائیں', description: 'سفر اور حفاظت کی دعائیں۔' },
  },
  wudu: {
    en: { name: 'Wudu Duas', description: 'Remembrances for ablution and purification.' },
    ar: { name: 'أذكار الوضوء', description: 'أذكار الوضوء والتطهير.' },
    fr: { name: 'Duas des ablutions', description: 'Invocations pour les ablutions.' },
    id: { name: 'Doa wudu', description: 'Dzikir untuk wudu dan bersuci.' },
    ur: { name: 'وضو کے اذکار', description: 'وضو اور پاکی کے اذکار۔' },
  },
  mosque: {
    en: { name: 'Mosque Duas', description: 'Duas for entering and leaving the mosque.' },
    ar: { name: 'أذكار المسجد', description: 'أدعية دخول المسجد والخروج منه.' },
    fr: { name: 'Duas de la mosquée', description: 'Invocations d\'entrée et de sortie de la mosquée.' },
    id: { name: 'Doa masjid', description: 'Doa masuk dan keluar masjid.' },
    ur: { name: 'مسجد کی دعائیں', description: 'مسجد میں داخلے اور نکلنے کی دعائیں۔' },
  },
  home: {
    en: { name: 'Home Duas', description: 'Duas for entering and leaving the home.' },
    ar: { name: 'أذكار المنزل', description: 'أدعية دخول المنزل والخروج منه.' },
    fr: { name: 'Duas de la maison', description: 'Invocations pour entrer et sortir de chez soi.' },
    id: { name: 'Doa rumah', description: 'Doa masuk dan keluar rumah.' },
    ur: { name: 'گھر کی دعائیں', description: 'گھر میں داخلے اور نکلنے کی دعائیں۔' },
  },
  protection: {
    en: { name: 'Protection Duas', description: 'Adhkar seeking Allah\'s protection.' },
    ar: { name: 'أذكار الحماية', description: 'أذكار الاستعاذة والحماية.' },
    fr: { name: 'Duas de protection', description: 'Invocations de protection.' },
    id: { name: 'Doa perlindungan', description: 'Dzikir memohon perlindungan.' },
    ur: { name: 'حفاظت کی دعائیں', description: 'اللہ کی پناہ کی دعائیں۔' },
  },
  distress: {
    en: { name: 'Distress Duas', description: 'Supplications in anxiety and hardship.' },
    ar: { name: 'أذكار الكرب', description: 'أدعية الكرب والهم.' },
    fr: { name: 'Duas de détresse', description: 'Invocations dans l\'angoisse et l\'épreuve.' },
    id: { name: 'Doa kesulitan', description: 'Doa saat cemas dan kesulitan.' },
    ur: { name: 'پریشانی کی دعائیں', description: 'غم اور پریشانی میں دعائیں۔' },
  },
  forgiveness: {
    en: { name: 'Forgiveness Duas', description: 'Istighfar and seeking forgiveness.' },
    ar: { name: 'أذكار الاستغفار', description: 'أدعية الاستغفار.' },
    fr: { name: 'Duas de pardon', description: 'Istighfar et demandes de pardon.' },
    id: { name: 'Doa istighfar', description: 'Istighfar dan memohon ampunan.' },
    ur: { name: 'استغفار کی دعائیں', description: 'استغفار اور مغفرت کی دعائیں۔' },
  },
  ramadan: {
    en: { name: 'Ramadan Duas', description: 'Supplications for fasting and Ramadan nights.' },
    ar: { name: 'أدعية رمضان', description: 'أدعية الصيام وليالي رمضان.' },
    fr: { name: 'Duas de Ramadan', description: 'Invocations pour le jeûne et les nuits de Ramadan.' },
    id: { name: 'Doa Ramadan', description: 'Doa untuk puasa dan malam Ramadan.' },
    ur: { name: 'رمضان کی دعائیں', description: 'روزہ اور رمضان کی راتوں کی دعائیں۔' },
  },
}

function isDuaCategoryId(id: string): id is DuaCategoryId {
  return (DUA_CATEGORY_IDS as readonly string[]).includes(id)
}

function resolveDynamic(pathWithoutLocale: string, locale: LocaleCode): ResolvedSeo | null {
  const segments = pathWithoutLocale.split('/').filter(Boolean)

  if (segments[0] === 'quran' && segments.length === 2) {
    const num = Number(segments[1])
    const surah = getSurah(num)
    if (!surah) return null
    const copy = surahCopy(surah, locale, 'quran')
    const path = `/quran/${surah.number}`
    return baseResolved('surah', locale, path, copy, {
      surah,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Quran', path: '/quran' },
        { name: surah.nameLatin, path },
      ],
    })
  }

  if (segments[0] === 'tafsir' && segments.length === 2) {
    const num = Number(segments[1])
    const surah = getSurah(num)
    if (!surah) return null
    const copy = surahCopy(surah, locale, 'tafsir')
    const path = `/tafsir/${surah.number}`
    return baseResolved('tafsir_surah', locale, path, copy, {
      surah,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Tafsir', path: '/tafsir' },
        { name: surah.nameLatin, path },
      ],
    })
  }

  if (segments[0] === 'hadith' && segments.length === 2 && isHadithCollectionId(segments[1])) {
    const id = segments[1]
    const copy = hadithCollectionCopy(id, locale)
    const path = `/hadith/${id}`
    return baseResolved('hadith_collection', locale, path, copy, {
      hadithCollectionId: id,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Hadith', path: '/hadith' },
        { name: copy.h1, path },
      ],
    })
  }

  if (
    segments[0] === 'hadith' &&
    segments.length === 3 &&
    isHadithCollectionId(segments[1]) &&
    segments[2] === 'books'
  ) {
    const id = segments[1]
    const meta = getHadithCollectionMeta(id)
    const name = meta?.name ?? id
    const copy: PageSeoCopy = {
      title: `${name} Books`,
      description: `Browse books in ${name}.`,
      h1: `${name} Books`,
      body: `Book list for ${name}.`,
    }
    const path = `/hadith/${id}/books`
    return baseResolved('hadith_books', locale, path, copy, {
      hadithCollectionId: id,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Hadith', path: '/hadith' },
        { name: name, path: `/hadith/${id}` },
        { name: 'Books', path },
      ],
    })
  }

  if (
    segments[0] === 'hadith' &&
    segments.length === 4 &&
    isHadithCollectionId(segments[1]) &&
    segments[2] === 'books'
  ) {
    const id = segments[1]
    const bookNumber = segments[3]
    const meta = getHadithCollectionMeta(id)
    const name = meta?.name ?? id
    const copy: PageSeoCopy = {
      title: `${name}, Book ${bookNumber}`,
      description: `Hadith from ${name}, book ${bookNumber}.`,
      h1: `${name}, Book ${bookNumber}`,
      body: `Browse hadith in book ${bookNumber} of ${name}.`,
    }
    const path = `/hadith/${id}/books/${bookNumber}`
    return baseResolved('hadith_book', locale, path, copy, {
      hadithCollectionId: id,
      bookNumber,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Hadith', path: '/hadith' },
        { name: name, path: `/hadith/${id}` },
        { name: 'Books', path: `/hadith/${id}/books` },
        { name: `Book ${bookNumber}`, path },
      ],
    })
  }

  if (segments[0] === 'hadith' && segments.length === 3 && isHadithCollectionId(segments[1])) {
    const id = segments[1]
    const hadithId = segments[2]
    if (hadithId === 'books') return null
    if (!isSafeHadithSeoId(hadithId)) return null
    const meta = getHadithCollectionMeta(id)
    const name = meta?.name ?? id
    const copy = hadithEntryCopy(name, hadithId, locale)
    const path = `/hadith/${id}/${hadithId}`
    return baseResolved('hadith_entry', locale, path, copy, {
      hadithCollectionId: id,
      hadithId,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Hadith', path: '/hadith' },
        { name: name, path: `/hadith/${id}` },
        { name: `Hadith ${hadithId}`, path },
      ],
    })
  }

  if (segments[0] === 'prayer_times' && segments.length === 2 && isCitySlug(segments[1])) {
    const city = getCityBySlug(segments[1])
    if (!city) return null
    const copy = cityPrayerCopy(city, locale)
    const path = `/prayer_times/${city.slug}`
    const bearing = qiblaBearingDegrees(city.lat, city.lng)
    return baseResolved('prayer_city', locale, path, copy, {
      city,
      richText: `Coordinates ${city.lat.toFixed(4)}, ${city.lng.toFixed(4)}. Qibla about ${Math.round(bearing)}° from north. Timezone ${city.timezone}.`,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Prayer Times', path: '/prayer_times' },
        { name: city.nameEn, path },
      ],
    })
  }

  if (segments[0] === 'qibla' && segments.length === 2 && isCitySlug(segments[1])) {
    const city = getCityBySlug(segments[1])
    if (!city) return null
    const bearing = qiblaBearingDegrees(city.lat, city.lng)
    const copy = cityQiblaCopy(city, locale, bearing)
    const path = `/qibla/${city.slug}`
    return baseResolved('qibla_city', locale, path, copy, {
      city,
      richText: `Qibla bearing from ${city.nameEn}: ${bearing.toFixed(1)}°. Lat ${city.lat}, lng ${city.lng}.`,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Qibla', path: '/qibla' },
        { name: city.nameEn, path },
      ],
    })
  }

  if (
    segments[0] === 'ramadan' &&
    segments.length === 3 &&
    /^\d{4}$/.test(segments[1]) &&
    isCitySlug(segments[2])
  ) {
    const year = Number(segments[1])
    if (year < 2026 || year > 2035) return null
    const city = getCityBySlug(segments[2])
    if (!city) return null
    const copy = cityRamadanCopy(city, year, locale)
    const path = `/ramadan/${year}/${city.slug}`
    return baseResolved('ramadan_city', locale, path, copy, {
      city,
      richText: `Ramadan ${year} fasting schedule for ${city.nameEn} (${city.country}). Use local Fajr and Maghrib as suhoor and iftar guides.`,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Ramadan', path: '/ramadan' },
        { name: String(year), path: `/ramadan/${year}/${city.slug}` },
        { name: city.nameEn, path },
      ],
    })
  }

  if (segments[0] === 'duas' && segments.length === 2 && isDuaCategoryId(segments[1])) {
    const id = segments[1]
    const labels = DUA_CATEGORY_LABELS[id][locale]
    const copy: PageSeoCopy = {
      title: labels.name,
      description: labels.description,
      h1: labels.name,
      body: labels.description,
    }
    const path = `/duas/${id}`
    return baseResolved('dua_category', locale, path, copy, {
      duaCategoryId: id,
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Duas', path: '/duas' },
        { name: labels.name, path },
      ],
    })
  }

  return null
}

function baseResolved(
  kind: SeoKind,
  locale: LocaleCode,
  pathWithoutLocale: string,
  copy: PageSeoCopy,
  extra: Partial<ResolvedSeo> = {},
): ResolvedSeo {
  const canonicalPath = localizedPath(pathWithoutLocale, locale)
  const { noIndex: extraNoIndex, breadcrumbs: extraCrumbs, dateModified: extraModified, ...restExtra } =
    extra
  const noIndex = NOINDEX_PATHS.has(pathWithoutLocale) || Boolean(extraNoIndex)
  return {
    kind,
    locale,
    pathWithoutLocale,
    canonicalPath,
    canonicalUrl: absoluteUrl(canonicalPath),
    title: titleWithBrand(copy.title),
    description: copy.description,
    h1: copy.h1,
    body: copy.body,
    noIndex,
    status: 200,
    dir: getLanguageDirection(locale),
    alternates: hreflangAlternates(pathWithoutLocale),
    dateModified: extraModified ?? new Date().toISOString().slice(0, 10),
    breadcrumbs: extraCrumbs ?? [
      { name: 'Home', path: '/' },
      { name: copy.h1, path: pathWithoutLocale },
    ],
    ...restExtra,
  }
}

export interface ResolveSeoOptions {
  /** When false, city landing pages are noindex (flag off). Default true for resolve tests. */
  indexCityPages?: boolean
}

export function resolveSeo(pathname: string, options: ResolveSeoOptions = {}): ResolvedSeo {
  const { locale, pathWithoutLocale } = parseLocalePath(pathname)
  const indexCityPages = options.indexCityPages !== false

  if (pathWithoutLocale === '/onboarding') {
    const copy = getStaticPageCopy('welcome', locale)
    return baseResolved('static', locale, '/welcome', copy, { noIndex: true })
  }

  const staticCopy = getStaticCopyForPath(pathWithoutLocale, locale)
  if (staticCopy) {
    return baseResolved('static', locale, pathWithoutLocale, staticCopy)
  }

  const dynamic = resolveDynamic(pathWithoutLocale, locale)
  if (dynamic) {
    const isCity =
      dynamic.kind === 'prayer_city' ||
      dynamic.kind === 'qibla_city' ||
      dynamic.kind === 'ramadan_city'
    if (isCity && !indexCityPages) {
      return { ...dynamic, noIndex: true }
    }
    return dynamic
  }

  const notFound = getStaticPageCopy('not_found', locale)
  const canonicalPath = localizedPath(pathWithoutLocale, locale)
  return {
    kind: 'not_found',
    locale,
    pathWithoutLocale,
    canonicalPath,
    canonicalUrl: absoluteUrl(canonicalPath),
    title: titleWithBrand(notFound.title),
    description: notFound.description,
    h1: notFound.h1,
    body: notFound.body,
    noIndex: true,
    status: 404,
    dir: getLanguageDirection(locale),
    alternates: hreflangAlternates('/'),
    breadcrumbs: [{ name: 'Home', path: '/' }],
  }
}

export function isHtmlNavigation(request: Request): boolean {
  const accept = request.headers.get('Accept') ?? ''
  if (accept.includes('text/html')) return true
  const url = new URL(request.url)
  const path = url.pathname
  if (path.includes('.')) {
    const ext = path.split('.').pop()?.toLowerCase()
    if (
      ext &&
      [
        'js',
        'css',
        'png',
        'jpg',
        'jpeg',
        'gif',
        'svg',
        'ico',
        'webp',
        'woff',
        'woff2',
        'map',
        'json',
        'xml',
        'txt',
        'webmanifest',
        'mp3',
      ].includes(ext)
    ) {
      return false
    }
  }
  return request.method === 'GET' || request.method === 'HEAD'
}

export { SITE_URL }
