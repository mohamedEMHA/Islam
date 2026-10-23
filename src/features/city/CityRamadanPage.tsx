import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCityBySlug } from '@shared/seo/cities'
import { getPrayerTimes } from '@/lib/api/aladhan'
import { PageShell } from '@/components/ui/PageShell'
import { AttributionChip } from '@/components/content/AttributionChip'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { AsyncState } from '@/components/ui/AsyncState'
import { NotFoundPage } from '@/features/not_found/NotFoundPage'
import type { PrayerTimesResponse } from '@/types/prayer'

export function CityRamadanPage() {
  const { year = '2027', citySlug = '' } = useParams<{ year: string; citySlug: string }>()
  const { t } = useTranslation()
  const city = getCityBySlug(citySlug)
  const [data, setData] = useState<PrayerTimesResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!city) return
    let cancelled = false
    setLoading(true)
    getPrayerTimes({ latitude: city.lat, longitude: city.lng })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t('errors.generic'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [city, t])

  if (!city) return <NotFoundPage />
  const y = Number(year)
  if (!Number.isFinite(y) || y < 2026 || y > 2035) return <NotFoundPage />

  return (
    <PageShell
      title={t('pages.cityRamadan.title', { year: y, city: city.nameEn })}
      subtitle={t('pages.cityRamadan.subtitle', { year: y, city: city.nameEn })}
    >
      <AsyncState loading={loading} error={error}>
        {data ? (
          <div className="space-y-4 max-w-xl">
            <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
              {t('pages.cityRamadan.guide')}
            </p>
            <dl className="grid grid-cols-2 gap-3 font-body-md text-body-md">
              <div>
                <dt className="text-stone dark:text-dark-text-secondary">{t('pages.cityRamadan.suhoor')}</dt>
                <dd className="tabular-nums font-medium">{data.timings.Fajr}</dd>
              </div>
              <div>
                <dt className="text-stone dark:text-dark-text-secondary">{t('pages.cityRamadan.iftar')}</dt>
                <dd className="tabular-nums font-medium">{data.timings.Maghrib}</dd>
              </div>
            </dl>
            <LocalizedLink
              to={`/prayer_times/${city.slug}`}
              className="inline-block text-secondary dark:text-dark-green underline font-label-sm text-label-sm"
            >
              {t('pages.cityRamadan.linkPrayer')}
            </LocalizedLink>
            <AttributionChip source="AlAdhan API" />
          </div>
        ) : null}
      </AsyncState>
    </PageShell>
  )
}
