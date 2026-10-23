import { readFileSync, writeFileSync } from 'node:fs'

const path = 'src/i18n/locales'

const patches = {
  ar: {
    cityPrayer: {
      title: 'مواقيت الصلاة في {{city}}',
      subtitle: 'الصلوات اليومية في {{city}} ({{country}}) مع مرجع القبلة.',
      qibla: 'القبلة من {{city}} حوالي {{degrees}}° من الشمال.',
      linkQibla: 'القبلة لهذه المدينة',
      linkRamadan: 'جدول رمضان 2027',
      linkLive: 'استخدم موقعي بدلًا من ذلك',
    },
    cityQibla: {
      title: 'القبلة من {{city}}',
      subtitle: 'اتجاه الكعبة من {{city}}.',
      body: 'الاتجاه التقريبي {{degrees}}°. حوالي {{km}} كم إلى مكة.',
      linkPrayer: 'مواقيت الصلاة لهذه المدينة',
    },
    cityRamadan: {
      title: 'رمضان {{year}} في {{city}}',
      subtitle: 'دليل السحور والإفطار لـ {{city}} في {{year}}.',
      guide: 'استخدم الفجر كمرجع للسحور والمغرب للإفطار. أكّد مع مسجدك المحلي.',
      suhoor: 'السحور (الفجر)',
      iftar: 'الإفطار (المغرب)',
      linkPrayer: 'مواقيت الصلاة الكاملة',
    },
    methodologyTitle: 'المنهجية',
    methodologyBody:
      'يجمع islam.house بيانات إسلامية عامة مع إسناد واضح. لا نخترع درجات الحديث أو نص القرآن. مواقيت الصلاة بطرق حساب منشورة يمكن تغييرها في الإعدادات. بلّغ عن الأخطاء من أي صفحة. العلامة: islam.house (غير مرتبط بـ islamhouse.com).',
    installTitle: 'ثبّت islam.house',
    installSubtitle: 'أضف تطبيق الويب المجاني لمواقيت الصلاة والقرآن والحديث دون اتصال.',
  },
  fr: {
    cityPrayer: {
      title: 'Horaires de prière à {{city}}',
      subtitle: 'Salat quotidienne pour {{city}} ({{country}}) avec référence qibla.',
      qibla: 'La qibla depuis {{city}} est environ {{degrees}}° depuis le nord.',
      linkQibla: 'Qibla pour cette ville',
      linkRamadan: 'Calendrier Ramadan 2027',
      linkLive: 'Utiliser ma position',
    },
    cityQibla: {
      title: 'Qibla depuis {{city}}',
      subtitle: 'Direction de la Kaaba depuis {{city}}.',
      body: "Cap approximatif {{degrees}}°. Environ {{km}} km jusqu'à La Mecque.",
      linkPrayer: 'Horaires de prière pour cette ville',
    },
    cityRamadan: {
      title: 'Ramadan {{year}} à {{city}}',
      subtitle: 'Guide suhoor et iftar pour {{city}} en {{year}}.',
      guide: 'Utilisez Fajr comme guide suhoor et Maghrib pour iftar. Confirmez avec votre mosquée.',
      suhoor: 'Suhoor (Fajr)',
      iftar: 'Iftar (Maghrib)',
      linkPrayer: 'Horaires complets',
    },
    methodologyTitle: 'Méthodologie',
    methodologyBody:
      "islam.house compile des API islamiques publiques avec attribution claire. Nous n'inventons pas les grades de hadith ni le texte coranique. Les horaires utilisent des méthodes publiées modifiables dans les réglages. Signalez les erreurs depuis toute page. Marque: islam.house (non affilié à islamhouse.com).",
    installTitle: 'Installer islam.house',
    installSubtitle: 'Ajoutez la PWA gratuite pour horaires, Coran et hadiths hors ligne.',
  },
  id: {
    cityPrayer: {
      title: 'Jadwal sholat {{city}}',
      subtitle: 'Sholat harian untuk {{city}} ({{country}}) dengan kiblat.',
      qibla: 'Kiblat dari {{city}} sekitar {{degrees}}° dari utara.',
      linkQibla: 'Kiblat kota ini',
      linkRamadan: 'Jadwal Ramadan 2027',
      linkLive: 'Gunakan lokasi saya',
    },
    cityQibla: {
      title: 'Kiblat dari {{city}}',
      subtitle: "Arah Ka'bah dari {{city}}.",
      body: 'Arah perkiraan {{degrees}}°. Sekitar {{km}} km ke Makkah.',
      linkPrayer: 'Jadwal sholat kota ini',
    },
    cityRamadan: {
      title: 'Ramadan {{year}} di {{city}}',
      subtitle: 'Panduan sahur dan berbuka untuk {{city}} tahun {{year}}.',
      guide: 'Gunakan Subuh sebagai panduan sahur dan Magrib untuk berbuka. Konfirmasi dengan masjid setempat.',
      suhoor: 'Sahur (Subuh)',
      iftar: 'Berbuka (Magrib)',
      linkPrayer: 'Jadwal sholat lengkap',
    },
    methodologyTitle: 'Metodologi',
    methodologyBody:
      'islam.house menyusun API Islam publik dengan atribusi jelas. Kami tidak mengarang penilaian hadits atau teks Quran. Jadwal sholat memakai metode terbitan yang bisa diubah di Pengaturan. Laporkan masalah dari halaman mana pun. Merek: islam.house (tidak terkait islamhouse.com).',
    installTitle: 'Pasang islam.house',
    installSubtitle: 'Tambahkan PWA gratis untuk jadwal sholat, Quran, dan hadits offline.',
  },
  ur: {
    cityPrayer: {
      title: '{{city}} میں نماز کے اوقات',
      subtitle: '{{city}} ({{country}}) کے روزانہ اوقات قبلہ کے ساتھ۔',
      qibla: '{{city}} سے قبلہ تقریباً {{degrees}}° شمال سے ہے۔',
      linkQibla: 'اس شہر کا قبلہ',
      linkRamadan: 'رمضان 2027 کا شیڈول',
      linkLive: 'میرا مقام استعمال کریں',
    },
    cityQibla: {
      title: '{{city}} سے قبلہ',
      subtitle: '{{city}} سے کعبہ کی سمت۔',
      body: 'تقریبی سمت {{degrees}}°۔ مکہ تک تقریباً {{km}} کلومیٹر۔',
      linkPrayer: 'اس شہر کے نماز کے اوقات',
    },
    cityRamadan: {
      title: '{{city}} میں رمضان {{year}}',
      subtitle: '{{year}} میں {{city}} کے لیے سحری اور افطار رہنمائی۔',
      guide: 'سحری کے لیے فجر اور افطار کے لیے مغرب استعمال کریں۔ مقامی مسجد سے تصدیق کریں۔',
      suhoor: 'سحری (فجر)',
      iftar: 'افطار (مغرب)',
      linkPrayer: 'مکمل نماز کے اوقات',
    },
    methodologyTitle: 'طریقہ کار',
    methodologyBody:
      'islam.house عوامی اسلامی APIs کو واضح اسناد کے ساتھ مرتب کرتا ہے۔ ہم حدیث کے درجات یا قرآن کا متن نہیں گھڑتے۔ نماز کے اوقات قابلِ تبدیلی طریقوں پر ہیں۔ کسی بھی صفحے سے غلطی رپورٹ کریں۔ برانڈ: islam.house (islamhouse.com سے غیر متعلق)۔',
    installTitle: 'islam.house انسٹال کریں',
    installSubtitle: 'آف لائن نماز، قرآن اور حدیث کے لیے مفت PWA شامل کریں۔',
  },
}

for (const [code, patch] of Object.entries(patches)) {
  const file = `${path}/${code}.json`
  const j = JSON.parse(readFileSync(file, 'utf8'))
  j.pages = j.pages || {}
  j.pages.cityPrayer = patch.cityPrayer
  j.pages.cityQibla = patch.cityQibla
  j.pages.cityRamadan = patch.cityRamadan
  j.pages.sources = j.pages.sources || {}
  j.pages.sources.methodologyTitle = patch.methodologyTitle
  j.pages.sources.methodologyBody = patch.methodologyBody
  j.home = j.home || {}
  j.home.installTitle = patch.installTitle
  j.home.installSubtitle = patch.installSubtitle
  writeFileSync(file, `${JSON.stringify(j, null, 2)}\n`)
  console.log(code, 'ok')
}

const enFile = `${path}/en.json`
const en = JSON.parse(readFileSync(enFile, 'utf8'))
en.pages.sources.methodologyTitle = 'Methodology'
en.pages.sources.methodologyBody =
  'islam.house compiles public Islamic data APIs with clear attribution. We do not invent hadith grades or Quran text. Prayer times use published calculation methods you can change in Settings. Report issues from any content page. Brand: islam.house (not affiliated with islamhouse.com).'
writeFileSync(enFile, `${JSON.stringify(en, null, 2)}\n`)
console.log('en methodology ok')
