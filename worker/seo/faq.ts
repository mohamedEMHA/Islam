import type { LocaleCode } from '../../shared/seo/locale.ts'

interface FaqItem {
  q: string
  a: string
}

const FAQ: Record<LocaleCode, FaqItem[]> = {
  en: [
    {
      q: 'Where does the content come from?',
      a: 'Prayer times use AlAdhan. Quran text and audio come from Quran.com. Hadith collections use sunnah.com and open authentic datasets. Duas and many tools use local curated data plus UmmahAPI. Every major page shows attribution.',
    },
    {
      q: 'Does it work offline?',
      a: 'Yes for core practice. The PWA caches prayer times, Quran, and hadith responses so you can keep reading when connectivity drops.',
    },
    {
      q: 'Can I change the prayer calculation method?',
      a: 'Yes. Settings lets you pick calculation method, madhab, high latitude rule, and fine tune offsets so times match your local convention.',
    },
    {
      q: 'Is my location private?',
      a: 'Coordinates you approve are stored locally in your browser. Location-based features send coordinates to prayer and map APIs. We do not sell data and the app is ad free.',
    },
    {
      q: 'Are there ads or tracking?',
      a: 'No ads. The product is designed as a calm, distraction free space for daily practice.',
    },
  ],
  ar: [
    {
      q: 'من أين يأتي المحتوى؟',
      a: 'مواقيت الصلاة من AlAdhan. القرآن من Quran.com. الأحاديث من sunnah.com ومصادر موثقة. الأدعية محلية مع UmmahAPI. كل صفحة توضح المصدر.',
    },
    {
      q: 'هل يعمل دون إنترنت؟',
      a: 'نعم للاستخدام الأساسي. يخزن التطبيق مواقيت الصلاة والقرآن والحديث للقراءة دون اتصال.',
    },
    {
      q: 'هل يمكن تغيير طريقة حساب الصلاة؟',
      a: 'نعم من الإعدادات: طريقة الحساب والمذهب وقاعدة خطوط العرض العالية.',
    },
    {
      q: 'هل موقعي خاص؟',
      a: 'الإحداثيات تُحفظ محلياً وتُرسل فقط لواجهات المواقيت والخرائط عند الحاجة. لا نبيع البيانات ولا إعلانات.',
    },
    {
      q: 'هل توجد إعلانات؟',
      a: 'لا إعلانات. التطبيق مساحة هادئة للعبادة اليومية.',
    },
  ],
  fr: [
    {
      q: 'D\'où vient le contenu ?',
      a: 'Horaires via AlAdhan. Coran via Quran.com. Hadiths via sunnah.com. Duas locaux et UmmahAPI. Attribution sur chaque page majeure.',
    },
    {
      q: 'Fonctionne-t-il hors ligne ?',
      a: 'Oui pour l\'essentiel. La PWA met en cache horaires, Coran et hadiths.',
    },
    {
      q: 'Puis-je changer la méthode de calcul ?',
      a: 'Oui dans les réglages: méthode, madhab et règles de haute latitude.',
    },
    {
      q: 'Ma position est-elle privée ?',
      a: 'Coordonnées stockées localement, envoyées aux API de prière et cartes seulement si besoin. Pas de vente de données, sans publicité.',
    },
    {
      q: 'Y a-t-il de la publicité ?',
      a: 'Non. Espace calme pour la pratique quotidienne.',
    },
  ],
  id: [
    {
      q: 'Dari mana kontennya?',
      a: 'Jadwal sholat dari AlAdhan. Quran dari Quran.com. Hadits dari sunnah.com. Doa lokal plus UmmahAPI. Setiap halaman utama menampilkan atribusi.',
    },
    {
      q: 'Apakah bisa offline?',
      a: 'Ya untuk praktik inti. PWA menyimpan cache jadwal, Quran, dan hadits.',
    },
    {
      q: 'Bisakah mengubah metode perhitungan?',
      a: 'Ya di pengaturan: metode, mazhab, dan aturan lintang tinggi.',
    },
    {
      q: 'Apakah lokasi saya privat?',
      a: 'Koordinat disimpan lokal dan dikirim ke API sholat/peta bila perlu. Tidak menjual data, tanpa iklan.',
    },
    {
      q: 'Ada iklan?',
      a: 'Tidak. Ruang tenang untuk ibadah harian.',
    },
  ],
  ur: [
    {
      q: 'مواد کہاں سے آتا ہے؟',
      a: 'نماز کے اوقات AlAdhan سے۔ قرآن Quran.com سے۔ احادیث sunnah.com سے۔ دعائیں مقامی اور UmmahAPI۔ ہر صفحے پر ماخذ ہے۔',
    },
    {
      q: 'کیا آف لائن کام کرتا ہے؟',
      a: 'بنیادی استعمال کے لیے ہاں۔ PWA اوقات، قرآن اور حدیث محفوظ رکھتی ہے۔',
    },
    {
      q: 'کیا حساب کا طریقہ بدل سکتے ہیں؟',
      a: 'ہاں سیٹنگز میں طریقہ، مذہب اور اونچے عرض البلد کے قواعد۔',
    },
    {
      q: 'کیا میرا مقام محفوظ ہے؟',
      a: 'کوآرڈینیٹس مقامی طور پر محفوظ؛ ضرورت پر نماز/نقشہ APIs کو بھیجے جاتے ہیں۔ ڈیٹا فروخت نہیں، اشتہار نہیں۔',
    },
    {
      q: 'کیا اشتہارات ہیں؟',
      a: 'نہیں۔ روزمرہ عبادت کے لیے پرسکون جگہ۔',
    },
  ],
}

export function homeFaqItems(locale: LocaleCode): FaqItem[] {
  return FAQ[locale] ?? FAQ.en
}

export function faqPageJsonLd(locale: LocaleCode): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: homeFaqItems(locale).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}
