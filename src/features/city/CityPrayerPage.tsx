import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCityBySlug, qiblaBearingDegrees } from '@shared/seo/cities'
import { getPrayerTimes } from '@/lib/api/aladhan'
import { PageShell } from '@/components/ui/PageShell'
import { AttributionChip } from '@/components/content/AttributionChip'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { AsyncState } from '@/components/ui/AsyncState'
import { PRAYER_ORDER } from '@/types/prayer'
import type { PrayerTimesResponse } from '@/types/prayer'
import { NotFoundPage } from '@/features/not_found/NotFoundPage'

export function CityPrayerPage() {
  const { citySlug = '' } = useParams<{ citySlug: string }>()
  const { t } = useTranslation()
  const city = getCityBySlug(citySlug)
  const [data, setData] = useState<PrayerTimesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!city) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getPrayerTimes({ latitude: city.lat, longitude: city.lng })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('errors.generic'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [city, t])

  if (!city) return <NotFoundPage />

  const bearing = Math.round(qiblaBearingDegrees(city.lat, city.lng))

  return (
    <PageShell
      title={t('pages.cityPrayer.title', { city: city.nameEn })}
      subtitle={t('pages.cityPrayer.subtitle', { city: city.nameEn, country: city.country })}
    >
      <AsyncState loading={loading} error={error}>
        {data ? (
          <div className="space-y-6 max-w-xl">
            <ul className="space-y-2">
              {PRAYER_ORDER.map((name) => (
                <li
                  key={name}
                  className="flex justify-between border-b border-hairline dark:border-dark-border py-2 font-body-md text-body-md"
                >
                  <span>{t(`prayers.${name}`, { defaultValue: name })}</span>
                  <span className="tabular-nums">{data.timings[name]}</span>
                </li>
              ))}
            </ul>
            <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
              {t('pages.cityPrayer.qibla', { degrees: bearing })}
            </p>
            <div className="flex flex-wrap gap-3 font-label-sm text-label-sm">
              <LocalizedLink to={`/qibla/${city.slug}`} className="text-secondary dark:text-dark-green underline">
                {t('pages.cityPrayer.linkQibla')}
              </LocalizedLink>
              <LocalizedLink
                to={`/ramadan/2027/${city.slug}`}
                className="text-secondary dark:text-dark-green underline"
              >
                {t('pages.cityPrayer.linkRamadan')}
              </LocalizedLink>
              <LocalizedLink to="/prayer_times" className="text-secondary dark:text-dark-green underline">
                {t('pages.cityPrayer.linkLive')}
              </LocalizedLink>
            </div>
            <AttributionChip source="AlAdhan API" />
          </div>
        ) : null}
      </AsyncState>
    </PageShell>
  )
}
