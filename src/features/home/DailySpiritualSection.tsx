import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FadeInSection } from '@/components/motion/FadeInSection'
import { ArabicText } from '@/components/content/ArabicText'
import { AttributionChip } from '@/components/content/AttributionChip'
import { TabPills } from '@/components/ui/TabPills'
import { TabFade } from '@/components/motion/TabFade'
import { Button } from '@/components/ui/Button'
import { DailyFeedSkeleton } from '@/components/ui/Skeleton'
import { useDailySpiritualTab } from '@/lib/hooks/useDailySpiritualFeed'
import type { DailySpiritualTab } from '@/lib/utils/dailySpiritual'

const TABS: DailySpiritualTab[] = [
  'verse',
  'hadith',
  'morning_adhkar',
  'evening_adhkar',
  'after_prayer',
]

export function DailySpiritualSection() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<DailySpiritualTab>('verse')
  const { data: feed, isLoading, isError, refetch } = useDailySpiritualTab(activeTab)
  const showEnglishNotice =
    i18n.language.split('-')[0] !== 'en' &&
    (activeTab === 'hadith' ||
      activeTab === 'morning_adhkar' ||
      activeTab === 'evening_adhkar' ||
      activeTab === 'after_prayer')


  const tabLabels: Record<DailySpiritualTab, string> = {
    verse: t('home.dailyFeed.tabs.verse'),
    hadith: t('home.dailyFeed.tabs.hadith'),
    morning_adhkar: t('home.dailyFeed.tabs.morningAdhkar'),
    evening_adhkar: t('home.dailyFeed.tabs.eveningAdhkar'),
    after_prayer: t('home.dailyFeed.tabs.afterPrayer'),
  }

  const shareType = feed?.type === 'verse' ? 'ayah' : feed?.type === 'hadith' ? 'hadith' : 'adhkar'
  const shareReference = feed?.reference ?? ''

  return (
    <section
      id="daily-reflection"
      className="bg-surface-container dark:bg-dark-surface py-section-y border-y border-hairline dark:border-dark-border relative overflow-hidden scroll-mt-28"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <span className="font-arabic-quran text-[200px] md:text-[300px] text-ink-black dark:text-dark-text" dir="rtl">
          نور
        </span>
      </div>

      <FadeInSection className="px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto text-center relative z-10">
        <span className="font-label-sm text-label-sm text-secondary dark:text-dark-green uppercase tracking-widest mb-3 block">
          {t('home.dailyFeed.title')}
        </span>
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-6 max-w-2xl mx-auto">
          {t('home.dailyFeed.subtitle')}
        </p>

        <TabPills
          tabs={TABS.map((id) => ({ id, label: tabLabels[id] }))}
          active={activeTab}
          onChange={setActiveTab}
          className="justify-center mb-8"
        />

        <TabFade activeKey={activeTab}>
        {isLoading && <DailyFeedSkeleton />}

        {isError && !isLoading && !feed && (
          <blockquote className="mb-8 max-w-2xl mx-auto rounded-xl border border-hairline dark:border-dark-border bg-paper-white/80 dark:bg-dark-bg/60 px-6 py-8 md:px-10 md:py-10 text-center">
            <p className="font-body-lg text-body-lg text-ink-soft dark:text-dark-text-secondary leading-relaxed">
              &ldquo;{t('home.fallbackReflection')}&rdquo;
            </p>
            <footer className="mt-6 pt-4 border-t border-hairline/60 dark:border-dark-border font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
              <p>{t('home.ayahReference', { surah: 93, ayah: 7 })}</p>
            </footer>
            <div className="mt-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
                {t('common.retry')}
              </Button>
            </div>
          </blockquote>
        )}

        {isError && !isLoading && feed && (
          <div className="mb-8 space-y-4">
            <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
              {t('home.dailyFeed.error')}
            </p>
            <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
              {t('common.retry')}
            </Button>
          </div>
        )}

        {feed && !isLoading && (
          <blockquote className="mb-8 max-w-2xl mx-auto rounded-xl border border-hairline dark:border-dark-border bg-paper-white/80 dark:bg-dark-bg/60 px-6 py-8 md:px-10 md:py-10 text-center">
            {showEnglishNotice ? (
              <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mb-4">
                {t('home.dailyFeed.contentEnglishOnly')}
              </p>
            ) : null}
            {'title' in feed && feed.title && (
              <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green uppercase tracking-widest mb-5">
                {feed.title}
              </p>
            )}

            {feed.arabic && (
              <ArabicText size="lg" className="text-primary dark:text-dark-green mb-6">
                {feed.arabic}
              </ArabicText>
            )}

            {'transliteration' in feed && feed.transliteration && (
              <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary italic mb-4">
                {feed.transliteration}
              </p>
            )}

            <p className="font-body-lg text-body-lg text-ink-soft dark:text-dark-text-secondary leading-relaxed">
              &ldquo;{feed.text}&rdquo;
            </p>

            <footer className="mt-6 pt-4 border-t border-hairline/60 dark:border-dark-border font-label-sm text-label-sm text-stone dark:text-dark-text-secondary space-y-1">
              <p>
                {feed.type === 'verse'
                  ? t('home.ayahReference', { surah: feed.surah, ayah: feed.ayah })
                  : feed.reference}
              </p>
              {'grade' in feed && feed.grade && <p>{feed.grade}</p>}
              {'repeat' in feed && feed.repeat && (
                <p>{t('home.dailyFeed.repeat', { count: feed.repeat })}</p>
              )}
            </footer>
          </blockquote>
        )}
        </TabFade>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {feed && !isLoading && (
            <Link
              to={`/share?type=${shareType}&ref=${encodeURIComponent(shareReference)}`}
              rel="nofollow"
              className="h-11 w-11 rounded-full border border-hairline dark:border-dark-border flex items-center justify-center text-ink-soft dark:text-dark-text-secondary hover:bg-paper-white dark:hover:bg-dark-bg transition-colors"
              aria-label={t('common.share')}
            >
              <span className="material-symbols-outlined text-sm">share</span>
            </Link>
          )}

          {feed?.type === 'verse' && feed.surah > 0 && (
            <Link
              to={`/tafsir/${feed.surah}`}
              className="inline-flex items-center gap-2 min-h-11 px-4 py-2.5 rounded-full border border-hairline dark:border-dark-border font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary hover:bg-paper-white dark:hover:bg-dark-bg transition-colors"
            >
              {t('home.dailyFeed.readTafsir')}
              <span className="material-symbols-outlined text-sm">menu_book</span>
            </Link>
          )}

          <Link
            to="/duas"
            className="inline-flex items-center gap-2 min-h-11 px-4 py-2.5 rounded-full border border-hairline dark:border-dark-border font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary hover:bg-paper-white dark:hover:bg-dark-bg transition-colors"
          >
            {t('home.dailyFeed.browseDuas')}
            <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_forward</span>
          </Link>
        </div>

        <AttributionChip source="UmmahAPI" url="https://ummahapi.com" page="Daily Spiritual Feed" />
      </FadeInSection>
    </section>
  )
}
