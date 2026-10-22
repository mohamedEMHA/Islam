import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { FadeInSection } from '@/components/motion/FadeInSection'
import { HOME_TRUST_BADGES } from '@/lib/data/sources'

const TRUST_LABEL_KEYS: Record<string, string> = {
  aladhan: 'trust.prayerTimes',
  quran: 'trust.quran',
  hadith: 'trust.hadith',
  duas: 'trust.duas',
  zakat: 'trust.zakat',
}

export function TrustStrip() {
  const { t } = useTranslation()

  return (
    <FadeInSection>
      <section
        className="border-y border-hairline dark:border-dark-border bg-surface dark:bg-dark-surface"
        aria-label={t('home.trustedSources')}
      >
        <div className="px-margin-mobile md:px-margin-desktop py-6 md:py-8 max-w-screen-2xl mx-auto">
          <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary text-center mb-4 uppercase tracking-widest">
            {t('home.trustedSources')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 items-center md:opacity-60 md:grayscale hover:md:grayscale-0 transition-[filter,opacity] duration-500">
            {HOME_TRUST_BADGES.map((badge) => (
              <a
                key={badge.id}
                href={badge.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('home.trustBadgeAria', { label: t(TRUST_LABEL_KEYS[badge.id]) })}
                className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-full border border-hairline dark:border-dark-border bg-paper-white dark:bg-dark-bg font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary hover:text-secondary dark:hover:text-dark-green hover:border-outline-variant dark:hover:border-dark-green transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{badge.icon}</span>
                {t(TRUST_LABEL_KEYS[badge.id])}
              </a>
            ))}
            <LocalizedLink
              to="/sources"
              className="inline-flex items-center gap-1 min-h-11 px-3 py-2 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary hover:text-secondary dark:hover:text-dark-green transition-colors"
            >
              {t('common.viewAll')}
              <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
            </LocalizedLink>
          </div>
        </div>
      </section>
    </FadeInSection>
  )
}
