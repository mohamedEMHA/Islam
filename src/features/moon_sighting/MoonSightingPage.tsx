import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { AttributionChip } from '@/components/content/AttributionChip'

export function MoonSightingPage() {
  const { t } = useTranslation()
  const { data } = usePrayerTimes()
  const hijri = data?.date.hijri

  return (
    <PageShell title={t('pages.moonSighting.title')} subtitle={t('pages.moonSighting.subtitle')}>
      <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-6 leading-relaxed">
        {t('pages.moonSighting.intro')}
      </p>

      {hijri ? (
        <HoverCard className="p-6 mb-6 dark:bg-dark-surface dark:border-dark-border">
          <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green mb-2">
            {t('pages.moonSighting.currentHijri')}
          </p>
          <p className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text">
            {hijri.day} {hijri.month.en} {hijri.year} AH
          </p>
          <p dir="rtl" className="font-arabic-ui text-primary dark:text-dark-green mt-2">
            {hijri.month.ar}
          </p>
        </HoverCard>
      ) : null}

      <HoverCard className="p-6 mb-6 dark:bg-dark-surface dark:border-dark-border">
        <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-3">
          {t('pages.moonSighting.astronomicalTitle')}
        </h2>
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
          {t('pages.moonSighting.astronomicalBody')}
        </p>
      </HoverCard>

      <Link
        to="/hijri_calendar"
        className="font-label-sm text-label-sm text-secondary dark:text-dark-green hover:underline"
      >
        {t('pages.moonSighting.openHijriCalendar')}
      </Link>

      <div className="mt-8">
        <AttributionChip source="AlAdhan API" url="https://aladhan.com" />
      </div>
    </PageShell>
  )
}
