import fs from 'node:fs'

const locales = {
  en: {
    'common.getApp': 'Coming Soon',
    'pages.getApp.title': 'Get App',
    'pages.getApp.subtitle': 'Native app experience is on the way',
    'pages.getApp.comingSoon': 'Coming soon',
    'pages.getApp.comingSoonMessage':
      'The Islam app is not ready yet. We are building a calm, offline-first experience. Meanwhile, you can use the full web app in your browser.',
    'pages.getApp.installTitle': 'Coming soon',
    'pages.getApp.message':
      'The Islam app is not ready yet. We are building a calm, offline-first experience. Meanwhile, you can use the full web app in your browser.',
    'home.installTitle': 'App coming soon',
    'home.installSubtitle':
      'A dedicated mobile app is on the way. Until then, use Islam in your browser.',
    'home.installLearnMore': 'Learn more',
  },
  ar: {
    'common.getApp': 'قريباً',
    'pages.getApp.title': 'تحميل التطبيق',
    'pages.getApp.subtitle': 'تجربة التطبيق الأصلي في الطريق',
    'pages.getApp.comingSoon': 'قريباً',
    'pages.getApp.comingSoonMessage':
      'تطبيق Islam ليس جاهزاً بعد. نبني تجربة هادئة تعمل دون اتصال. يمكنك استخدام النسخة الكاملة في المتصفح حالياً.',
    'pages.getApp.installTitle': 'قريباً',
    'pages.getApp.message':
      'تطبيق Islam ليس جاهزاً بعد. نبني تجربة هادئة تعمل دون اتصال. يمكنك استخدام النسخة الكاملة في المتصفح حالياً.',
    'home.installTitle': 'التطبيق قريباً',
    'home.installSubtitle': 'تطبيق مخصص للجوال في الطريق. حتى ذلك الحين، استخدم Islam في المتصفح.',
    'home.installLearnMore': 'اعرف المزيد',
  },
  ur: {
    'common.getApp': 'جلد آرہا ہے',
    'pages.getApp.title': 'ایپ حاصل کریں',
    'pages.getApp.subtitle': 'نیٹو ایپ کا تجربہ جلد آرہا ہے',
    'pages.getApp.comingSoon': 'جلد آرہا ہے',
    'pages.getApp.comingSoonMessage':
      'Islam ایپ ابھی تیار نہیں۔ ہم ایک پرسکون، آف لائن تجربہ بنا رہے ہیں۔ فی الحال آپ براؤزر میں مکمل ویب ایپ استعمال کر سکتے ہیں۔',
    'pages.getApp.installTitle': 'جلد آرہا ہے',
    'pages.getApp.message':
      'Islam ایپ ابھی تیار نہیں۔ ہم ایک پرسکون، آف لائن تجربہ بنا رہے ہیں۔ فی الحال آپ براؤزر میں مکمل ویب ایپ استعمال کر سکتے ہیں۔',
    'home.installTitle': 'ایپ جلد آرہی ہے',
    'home.installSubtitle': 'موبائل ایپ جلد آرہی ہے۔ تب تک براؤزر میں Islam استعمال کریں۔',
    'home.installLearnMore': 'مزید جانیں',
  },
  id: {
    'common.getApp': 'Segera hadir',
    'pages.getApp.title': 'Dapatkan Aplikasi',
    'pages.getApp.subtitle': 'Pengalaman aplikasi native sedang dalam perjalanan',
    'pages.getApp.comingSoon': 'Segera hadir',
    'pages.getApp.comingSoonMessage':
      'Aplikasi Islam belum siap. Kami sedang membangun pengalaman yang tenang dan offline-first. Sementara itu, gunakan web app lengkap di browser Anda.',
    'pages.getApp.installTitle': 'Segera hadir',
    'pages.getApp.message':
      'Aplikasi Islam belum siap. Kami sedang membangun pengalaman yang tenang dan offline-first. Sementara itu, gunakan web app lengkap di browser Anda.',
    'home.installTitle': 'Aplikasi segera hadir',
    'home.installSubtitle':
      'Aplikasi mobile khusus sedang dalam perjalanan. Sementara itu, gunakan Islam di browser.',
    'home.installLearnMore': 'Pelajari lebih lanjut',
  },
  fr: {
    'common.getApp': 'Bientôt disponible',
    'pages.getApp.title': "Obtenir l'application",
    'pages.getApp.subtitle': "L'expérience native arrive bientôt",
    'pages.getApp.comingSoon': 'Bientôt disponible',
    'pages.getApp.comingSoonMessage':
      "L'application Islam n'est pas encore prête. Nous construisons une expérience calme, utilisable hors ligne. En attendant, utilisez l'application web complète dans votre navigateur.",
    'pages.getApp.installTitle': 'Bientôt disponible',
    'pages.getApp.message':
      "L'application Islam n'est pas encore prête. Nous construisons une expérience calme, utilisable hors ligne. En attendant, utilisez l'application web complète dans votre navigateur.",
    'home.installTitle': 'Application bientôt disponible',
    'home.installSubtitle':
      'Une application mobile dédiée arrive bientôt. En attendant, utilisez Islam dans le navigateur.',
    'home.installLearnMore': 'En savoir plus',
  },
}

function setPath(obj, dotted, value) {
  const parts = dotted.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

for (const [code, map] of Object.entries(locales)) {
  const file = `./src/i18n/locales/${code}.json`
  const loc = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const [k, v] of Object.entries(map)) setPath(loc, k, v)
  fs.writeFileSync(file, `${JSON.stringify(loc, null, 2)}\n`)
  console.log(code, 'ok')
}
