import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { m as motion, useReducedMotion } from 'framer-motion'
import { PrayerTimesCard } from '@/components/ui/PrayerTimesCard'
import { ButtonLink } from '@/components/ui/Button'
import { BentoTile } from '@/components/ui/BentoTile'
import { StaggerChildren, StaggerItem } from '@/components/motion/FadeInSection'
import { TrustStrip } from '@/components/home/TrustStrip'
import { ContinueReadingSection } from '@/components/home/ContinueReadingSection'
import { SeasonalBanner } from '@/components/home/SeasonalBanner'
import { HomeFaqSection } from '@/components/home/HomeFaqSection'
import { InstallCtaSection } from '@/components/home/InstallCtaSection'
import { DailySpiritualSection } from '@/features/home/DailySpiritualSection'
import { heroStagger, fadeUp } from '@/lib/motion'
import { usePageMeta } from '@/lib/hooks/usePageMeta'

const DISCOVERY_LINKS = [
  { to: '/names', icon: 'auto_awesome', titleKey: 'home.discoveryNames', descKey: 'home.discoveryNamesDesc' },
  { to: '/hajj', icon: 'mosque', titleKey: 'home.discoveryHajj', descKey: 'home.discoveryHajjDesc' },
  { to: '/live', icon: 'live_tv', titleKey: 'home.discoveryLive', descKey: 'home.discoveryLiveDesc' },
  { to: '/tasbeeh', icon: 'radio_button_checked', titleKey: 'home.discoveryTasbeeh', descKey: 'home.discoveryTasbeehDesc' },
] as const

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const reduceMotion = useReducedMotion()
  const [searchQuery, setSearchQuery] = useState('')

  usePageMeta({
    title: t('home.hero'),
    description: t('home.subtitle'),
    path: '/',
  })

  useEffect(() => {
    if (hash !== '#daily-reflection') return
    const el = document.getElementById('daily-reflection')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <div className="bg-surface-container-low dark:bg-dark-bg">
      <section className="relative overflow-hidden min-h-[calc(100dvh-5rem)] flex items-center">
          <picture aria-hidden="true" className="absolute inset-0 block">
            <source srcSet="/brand/screen.avif" type="image/avif" />
            <source srcSet="/brand/screen.webp" type="image/webp" />
            <img
              src="/brand/screen.png"
              alt=""
              width={1600}
              height={900}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          <div
            className="absolute inset-0 bg-gradient-to-br from-cream/92 via-surface-container-low/82 to-green-soft/35 dark:from-dark-bg/94 dark:via-dark-bg/88 dark:to-dark-bg/72"
            aria-hidden="true"
          />
          <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop py-12 md:py-16 lg:py-20 max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
              <motion.div
                className="lg:col-span-7 flex flex-col items-start gap-5"
                variants={reduceMotion ? undefined : heroStagger}
                initial={reduceMotion ? false : 'hidden'}
                animate={reduceMotion ? false : 'visible'}
              >
                <motion.p variants={reduceMotion ? undefined : fadeUp} className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                  {t('home.statusLabel')}
                </motion.p>
                <motion.h1
                  variants={reduceMotion ? undefined : fadeUp}
                  className="font-display-h1 text-display-h1 text-ink-black dark:text-dark-text max-w-2xl leading-tight"
                >
                  {t('home.hero')}
                </motion.h1>
                <motion.p variants={reduceMotion ? undefined : fadeUp} className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary max-w-xl">
                  {t('home.subtitle')}
                </motion.p>

                <motion.form
                  variants={reduceMotion ? undefined : fadeUp}
                  onSubmit={handleSearch}
                  className="w-full max-w-xl"
                  role="search"
                >
                  <label htmlFor="home-search" className="sr-only">
                    {t('common.search')}
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-hairline dark:border-dark-border bg-paper-white/95 dark:bg-dark-surface/95 px-3 py-2 shadow-sm focus-within:border-secondary dark:focus-within:border-dark-green">
                    <span className="material-symbols-outlined text-stone dark:text-dark-text-secondary">search</span>
                    <input
                      id="home-search"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('home.searchPlaceholder')}
                      className="flex-1 bg-transparent border-0 outline-none font-body-md text-body-md text-ink-black dark:text-dark-text placeholder:text-stone dark:placeholder:text-dark-text-secondary min-w-0"
                    />
                    <button
                      type="submit"
                      className="shrink-0 min-h-11 px-3 py-1.5 rounded-md bg-secondary text-white font-label-sm text-label-sm hover:bg-primary transition-colors dark:bg-dark-green"
                    >
                      {t('common.search')}
                    </button>
                  </div>
                </motion.form>

                <motion.div variants={reduceMotion ? undefined : fadeUp} className="flex flex-wrap gap-3 pt-2">
                  <ButtonLink to="/prayer_times" size="lg" className="flex items-center gap-2">
                    {t('common.startJourney')}
                    <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
                  </ButtonLink>
                  <ButtonLink to="/quran" variant="secondary" size="lg">
                    {t('home.readQuran')}
                  </ButtonLink>
                </motion.div>
              </motion.div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <PrayerTimesCard />
              </div>
            </div>
          </div>
        </section>

      <ContinueReadingSection />
      <SeasonalBanner />
      <TrustStrip />

      <section className="px-margin-mobile md:px-margin-desktop pt-8 md:pt-10 pb-10 md:pb-14 max-w-screen-2xl mx-auto">
          <div className="section-intro max-w-3xl mx-auto text-center">
            <h2 className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-text mb-3">{t('home.bentoTitle')}</h2>
            <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">{t('home.bentoSubtitle')}</p>
          </div>
          <StaggerChildren className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 auto-rows-[minmax(168px,auto)] md:auto-rows-[minmax(188px,auto)]">
            <StaggerItem className="col-span-1 min-[400px]:col-span-2 md:col-span-2 row-span-2">
              <BentoTile
                to="/quran"
                title={t('home.quranTileTitle')}
                description={t('home.quranTileDesc')}
                icon="menu_book"
                variant="large"
              >
                <div className="mt-6 flex-grow flex items-end">
                  <div className="w-full bg-surface dark:bg-dark-bg border border-hairline dark:border-dark-border rounded-lg p-4 md:p-6 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p dir="rtl" className="font-arabic-quran text-arabic-quran text-start text-primary mb-3">
                      بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                    </p>
                    <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary italic text-center">
                      {t('home.bismillahTranslation')}
                    </p>
                  </div>
                </div>
              </BentoTile>
            </StaggerItem>
            <StaggerItem>
              <BentoTile to="/prayer_times" title={t('home.prayerTileTitle')} description={t('home.prayerTileDesc')} icon="schedule" />
            </StaggerItem>
            <StaggerItem>
              <BentoTile to="/duas" title={t('home.duasTileTitle')} description={t('home.duasTileDesc')} icon="volunteer_activism" />
            </StaggerItem>
            <StaggerItem>
              <BentoTile to="/qibla" title={t('home.qiblaTileTitle')} description={t('home.qiblaTileDesc')} icon="explore" />
            </StaggerItem>
            <StaggerItem>
              <BentoTile to="/shahada" title={t('home.shahadaTileTitle')} description={t('home.shahadaTileDesc')} icon="verified" />
            </StaggerItem>
            <StaggerItem>
              <BentoTile to="/adhan" title={t('home.adhanTileTitle')} description={t('home.adhanTileDesc')} icon="notifications_active" />
            </StaggerItem>
            <StaggerItem>
              <BentoTile to="/hadith" title={t('home.hadithTileTitle')} description={t('home.hadithTileDesc')} icon="library_books" variant="primary" />
            </StaggerItem>
            <StaggerItem className="col-span-1 min-[400px]:col-span-2 md:col-span-2">
              <BentoTile to="/zakat" title={t('home.zakatTileTitle')} description={t('home.zakatTileDesc')} icon="calculate" />
            </StaggerItem>
          </StaggerChildren>
        </section>

      <section className="px-margin-mobile md:px-margin-desktop py-section-y max-w-screen-2xl mx-auto border-t border-hairline dark:border-dark-border">
          <div className="section-intro max-w-2xl mx-auto text-center">
            <h2 className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-text mb-3">{t('home.discoveryTitle')}</h2>
            <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">{t('home.discoverySubtitle')}</p>
          </div>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DISCOVERY_LINKS.map((item) => (
              <StaggerItem key={item.to}>
                <Link
                  to={item.to}
                  className="group block p-5 rounded-xl border border-hairline dark:border-dark-border bg-paper-white dark:bg-dark-surface hover:border-secondary dark:hover:border-dark-green transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary dark:text-dark-green mb-3 block">{item.icon}</span>
                  <h3 className="font-body-lg text-body-lg font-medium text-ink-black dark:text-dark-text group-hover:text-secondary dark:group-hover:text-dark-green transition-colors mb-1">
                    {t(item.titleKey)}
                  </h3>
                  <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">{t(item.descKey)}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>

      <DailySpiritualSection />
      <HomeFaqSection />
      <InstallCtaSection />
    </div>
  )
}
