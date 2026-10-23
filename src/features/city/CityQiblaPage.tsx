import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCityBySlug, qiblaBearingDegrees } from '@shared/seo/cities'
import { calculateDistanceToKaaba } from '@/lib/utils/qibla'
import { PageShell } from '@/components/ui/PageShell'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { NotFoundPage } from '@/features/not_found/NotFoundPage'

export function CityQiblaPage() {
  const { citySlug = '' } = useParams<{ citySlug: string }>()
  const { t } = useTranslation()
  const city = getCityBySlug(citySlug)
  if (!city) return <NotFoundPage />

  const bearing = qiblaBearingDegrees(city.lat, city.lng)
  const km = calculateDistanceToKaaba(city.lat, city.lng)

  return (
    <PageShell
      title={t('pages.cityQibla.title', { city: city.nameEn })}
      subtitle={t('pages.cityQibla.subtitle', { city: city.nameEn })}
    >
      <div className="max-w-xl space-y-4">
        <p className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-text tabular-nums">
          {bearing.toFixed(1)}°
        </p>
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
          {t('pages.cityQibla.body', { city: city.nameEn, degrees: Math.round(bearing), km })}
        </p>
        <LocalizedLink
          to={`/prayer_times/${city.slug}`}
          className="inline-block font-label-sm text-label-sm text-secondary dark:text-dark-green underline"
        >
          {t('pages.cityQibla.linkPrayer')}
        </LocalizedLink>
      </div>
    </PageShell>
  )
}
