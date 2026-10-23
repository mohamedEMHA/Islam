import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { EmbedLayout } from '@/layouts/EmbedLayout'
import { OnboardingLayout } from '@/layouts/OnboardingLayout'
import { RootLayout } from '@/layouts/RootLayout'
import { HomePage } from '@/features/home/HomePage'
import { GetAppPage } from '@/features/get_app/GetAppPage'
import { RouteErrorPage } from '@/components/error/RouteErrorPage'
import { lazyPage, preloadCoreRoutes } from '@/components/routing/lazyPage'
import { LOCALE_PREFIXES } from '@/lib/i18n/localizedPath'

const WelcomePage = lazyPage(() => import('@/features/onboarding/WelcomePage'), 'WelcomePage')
const PrayerTimesPage = lazyPage(() => import('@/features/prayer_times/PrayerTimesPage'), 'PrayerTimesPage')
const QiblaPage = lazyPage(() => import('@/features/qibla/QiblaPage'), 'QiblaPage')
const QuranListPage = lazyPage(() => import('@/features/quran/QuranListPage'), 'QuranListPage')
const QuranReaderPage = lazyPage(() => import('@/features/quran/QuranReaderPage'), 'QuranReaderPage')
const TafsirPage = lazyPage(() => import('@/features/tafsir/TafsirPage'), 'TafsirPage')
const TafsirReaderPage = lazyPage(() => import('@/features/tafsir/TafsirReaderPage'), 'TafsirReaderPage')
const HadithCollectionsPage = lazyPage(() => import('@/features/hadith/HadithCollectionsPage'), 'HadithCollectionsPage')
const HadithBooksPage = lazyPage(() => import('@/features/hadith/HadithBooksPage'), 'HadithBooksPage')
const HadithBookPage = lazyPage(() => import('@/features/hadith/HadithBookPage'), 'HadithBookPage')
const HadithReaderPage = lazyPage(() => import('@/features/hadith/HadithReaderPage'), 'HadithReaderPage')
const DuasPage = lazyPage(() => import('@/features/duas/DuasPage'), 'DuasPage')
const SettingsPage = lazyPage(() => import('@/features/settings/SettingsPage'), 'SettingsPage')
const RamadanPage = lazyPage(() => import('@/features/ramadan/RamadanPage'), 'RamadanPage')
const ZakatPage = lazyPage(() => import('@/features/zakat/ZakatPage'), 'ZakatPage')
const TasbeehPage = lazyPage(() => import('@/features/tasbeeh/TasbeehPage'), 'TasbeehPage')
const NamesPage = lazyPage(() => import('@/features/names/NamesPage'), 'NamesPage')
const LivePage = lazyPage(() => import('@/features/live/LivePage'), 'LivePage')
const HajjPage = lazyPage(() => import('@/features/hajj/HajjPage'), 'HajjPage')
const BabyNamesPage = lazyPage(() => import('@/features/baby_names/BabyNamesPage'), 'BabyNamesPage')
const SourcesPage = lazyPage(() => import('@/features/sources/SourcesPage'), 'SourcesPage')
const HijriCalendarPage = lazyPage(() => import('@/features/hijri_calendar/HijriCalendarPage'), 'HijriCalendarPage')
const EventsPage = lazyPage(() => import('@/features/events/EventsPage'), 'EventsPage')
const SearchPage = lazyPage(() => import('@/features/search/SearchPage'), 'SearchPage')
const FatawaSearchPage = lazyPage(() => import('@/features/fatawa/FatawaSearchPage'), 'FatawaSearchPage')
const MoonSightingPage = lazyPage(() => import('@/features/moon_sighting/MoonSightingPage'), 'MoonSightingPage')
const InheritanceCalculatorPage = lazyPage(
  () => import('@/features/inheritance/InheritanceCalculatorPage'),
  'InheritanceCalculatorPage',
)
const IslamicLibraryPage = lazyPage(
  () => import('@/features/islamic_library/IslamicLibraryPage'),
  'IslamicLibraryPage',
)
const TermsPage = lazyPage(() => import('@/features/legal/TermsPage'), 'TermsPage')
const PrivacyPolicyPage = lazyPage(() => import('@/features/legal/PrivacyPolicyPage'), 'PrivacyPolicyPage')
const ShareCardPage = lazyPage(() => import('@/features/share/ShareCardPage'), 'ShareCardPage')
const ShahadaPage = lazyPage(() => import('@/features/shahada/ShahadaPage'), 'ShahadaPage')
const AdhanPage = lazyPage(() => import('@/features/adhan/AdhanPage'), 'AdhanPage')
const IslamicRadioPage = lazyPage(() => import('@/features/islamic_radio/IslamicRadioPage'), 'IslamicRadioPage')
const HalalVerificationPage = lazyPage(
  () => import('@/features/halal_verification/HalalVerificationPage'),
  'HalalVerificationPage',
)
const MosqueFinderPage = lazyPage(
  () => import('@/features/mosque_finder/MosqueFinderPage'),
  'MosqueFinderPage',
)
const CityPrayerPage = lazyPage(() => import('@/features/city/CityPrayerPage'), 'CityPrayerPage')
const CityQiblaPage = lazyPage(() => import('@/features/city/CityQiblaPage'), 'CityQiblaPage')
const CityRamadanPage = lazyPage(() => import('@/features/city/CityRamadanPage'), 'CityRamadanPage')
const PrayerTimesEmbedPage = lazyPage(
  () => import('@/features/embed/PrayerTimesEmbedPage'),
  'PrayerTimesEmbedPage',
)
const NotFoundPage = lazyPage(() => import('@/features/not_found/NotFoundPage'), 'NotFoundPage')

preloadCoreRoutes([
  PrayerTimesPage,
  QuranListPage,
  SearchPage,
  RamadanPage,
  HadithCollectionsPage,
  DuasPage,
  QiblaPage,
])

const marketingChildren: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: 'get_app', element: <GetAppPage /> },
  { path: 'sources', element: <SourcesPage /> },
  { path: 'privacy', element: <PrivacyPolicyPage /> },
  { path: 'terms', element: <TermsPage /> },
]

const onboardingChildren: RouteObject[] = [
  { path: 'welcome', element: <WelcomePage /> },
  { path: 'onboarding', element: <Navigate to="../welcome" replace /> },
]

const appChildren: RouteObject[] = [
  { path: 'app/privacy', element: <PrivacyPolicyPage /> },
  { path: 'app/terms', element: <TermsPage /> },
  { path: 'app/sources', element: <SourcesPage /> },
  { path: 'prayer_times', element: <PrayerTimesPage /> },
  { path: 'prayer_times/:citySlug', element: <CityPrayerPage /> },
  { path: 'adhan', element: <AdhanPage /> },
  { path: 'islamic_radio', element: <IslamicRadioPage /> },
  { path: 'qibla', element: <QiblaPage /> },
  { path: 'qibla/:citySlug', element: <CityQiblaPage /> },
  { path: 'quran', element: <QuranListPage /> },
  { path: 'quran/:surahId', element: <QuranReaderPage /> },
  { path: 'hadith', element: <HadithCollectionsPage /> },
  { path: 'hadith/:collection/books', element: <HadithBooksPage /> },
  { path: 'hadith/:collection/books/:bookNumber', element: <HadithBookPage /> },
  { path: 'hadith/:collection/:id', element: <HadithReaderPage /> },
  { path: 'duas', element: <DuasPage /> },
  { path: 'duas/:categoryId', element: <DuasPage /> },
  { path: 'settings', element: <SettingsPage /> },
  { path: 'ramadan', element: <RamadanPage /> },
  { path: 'ramadan/:year/:citySlug', element: <CityRamadanPage /> },
  { path: 'zakat', element: <ZakatPage /> },
  { path: 'tasbeeh', element: <TasbeehPage /> },
  { path: 'names', element: <NamesPage /> },
  { path: 'shahada', element: <ShahadaPage /> },
  { path: 'live', element: <LivePage /> },
  { path: 'hajj', element: <HajjPage /> },
  { path: 'baby_names', element: <BabyNamesPage /> },
  { path: 'hijri_calendar', element: <HijriCalendarPage /> },
  { path: 'events', element: <EventsPage /> },
  { path: 'search', element: <SearchPage /> },
  { path: 'fatawa', element: <FatawaSearchPage /> },
  { path: 'moon_sighting', element: <MoonSightingPage /> },
  { path: 'inheritance', element: <InheritanceCalculatorPage /> },
  { path: 'islamic_library', element: <IslamicLibraryPage /> },
  { path: 'tafsir', element: <TafsirPage /> },
  { path: 'tafsir/:surahId', element: <TafsirReaderPage /> },
  { path: 'mosque_finder', element: <MosqueFinderPage /> },
  { path: 'share', element: <ShareCardPage /> },
  { path: 'halal_verification', element: <HalalVerificationPage /> },
]

const embedChildren: RouteObject[] = [
  { path: 'embed/prayer_times', element: <PrayerTimesEmbedPage /> },
]

function layoutTree(idPrefix: string): RouteObject[] {
  return [
    {
      id: `${idPrefix}marketing`,
      element: <MarketingLayout />,
      children: marketingChildren,
    },
    {
      id: `${idPrefix}onboarding`,
      element: <OnboardingLayout />,
      children: onboardingChildren,
    },
    {
      id: `${idPrefix}app`,
      element: <AppLayout />,
      children: appChildren,
    },
    {
      id: `${idPrefix}embed`,
      element: <EmbedLayout />,
      children: embedChildren,
    },
  ]
}

const localeBranches: RouteObject[] = LOCALE_PREFIXES.map((locale) => ({
  path: locale,
  children: [
    ...layoutTree(`${locale}-`),
    { path: '*', element: <NotFoundPage /> },
  ],
}))

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      ...layoutTree(''),
      ...localeBranches,
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
