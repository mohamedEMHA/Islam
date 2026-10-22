import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/ui/PageShell'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { AsyncState } from '@/components/ui/AsyncState'
import { HoverCard } from '@/components/motion/HoverCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { AttributionChip } from '@/components/content/AttributionChip'
import { getDirectionsUrl, getOsmUrl } from '@/lib/api/overpass'
import { RADIUS_OPTIONS, useMosqueFinder } from '@/lib/hooks/useMosqueFinder'
import { formatDistanceMeters } from '@/lib/utils/haversine'

const MosqueMap = lazy(() =>
  import('@/components/mosque_finder/MosqueMap').then((module) => ({
    default: module.MosqueMap,
  })),
)

type ViewMode = 'map' | 'list'

export function MosqueFinderPage() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const {
    mosques,
    location,
    radiusM,
    setRadiusM,
    loading,
    locating,
    error,
    errorCode,
    refresh,
    requestGeolocation,
  } = useMosqueFinder()

  const showEmpty = !loading && errorCode === 'empty'
  const showFetchError = !loading && errorCode !== null && errorCode !== 'empty' && error !== null
  const locationLabel = location?.label ?? t('pages.mosqueFinder.currentLocation')

  return (
    <PageShell
      title={t('pages.mosqueFinder.title')}
      subtitle={t('pages.mosqueFinder.subtitle')}
      location={location?.label}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={requestGeolocation}
            disabled={locating}
          >
            <span className="material-symbols-outlined text-base me-1">my_location</span>
            {locating ? t('pages.mosqueFinder.locating') : t('pages.mosqueFinder.useMyLocation')}
          </Button>
          <Button variant="ghost" size="sm" onClick={refresh} disabled={loading || locating}>
            <span className="material-symbols-outlined text-base me-1">refresh</span>
            {t('common.retry')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-label-sm text-label-sm text-stone">
            {t('pages.mosqueFinder.radius')}
          </span>
          {RADIUS_OPTIONS.map((option) => (
            <Chip
              key={option}
              active={radiusM === option}
              onClick={() => setRadiusM(option)}
            >
              {option >= 1000 ? `${option / 1000} km` : `${option} m`}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip active={viewMode === 'map'} onClick={() => setViewMode('map')}>
            <span className="material-symbols-outlined text-sm">map</span>
            {t('pages.mosqueFinder.mapView')}
          </Chip>
          <Chip active={viewMode === 'list'} onClick={() => setViewMode('list')}>
            <span className="material-symbols-outlined text-sm">list</span>
            {t('pages.mosqueFinder.listView')}
          </Chip>
          {!loading && mosques.length > 0 && (
            <span className="font-label-sm text-label-sm text-stone ms-auto">
              {t('pages.mosqueFinder.resultCount', { count: mosques.length })}
            </span>
          )}
        </div>

        {showFetchError && (
          <HoverCard className="flex flex-col items-center py-8 px-6 text-center">
            <span className="material-symbols-outlined text-4xl text-error mb-3">
              {errorCode === 'geolocation' ? 'location_off' : 'cloud_off'}
            </span>
            <p className="font-body-md text-body-md text-ink-soft mb-4">{error}</p>
            <Button variant="primary" size="sm" onClick={refresh}>
              {t('common.retry')}
            </Button>
          </HoverCard>
        )}

        {!showFetchError && (
          <AsyncState
            loading={loading || locating}
            empty={showEmpty}
            loadingFallback={
              <div className="space-y-4">
                <Skeleton className="w-full h-[50vh] max-h-96 min-h-64 rounded-xl" />
                <Skeleton className="w-full h-24 rounded-xl" />
              </div>
            }
            emptyFallback={
              <HoverCard className="flex flex-col items-center py-10 px-6 text-center">
                <span className="material-symbols-outlined text-4xl text-stone mb-3">mosque</span>
                <p className="font-body-md text-body-md text-stone">{t('pages.mosqueFinder.noResults')}</p>
              </HoverCard>
            }
          >
            {location && viewMode === 'map' && (
              <Suspense fallback={<Skeleton className="w-full h-[50vh] max-h-96 min-h-64 rounded-xl" />}>
                <MosqueMap
                  userLat={location.latitude}
                  userLng={location.longitude}
                  mosques={mosques}
                  className="w-full h-[50vh] max-h-96 min-h-64 rounded-xl border border-hairline z-0"
                />
              </Suspense>
            )}

            {location && viewMode === 'list' && (
              <div className="space-y-3">
                {mosques.map((mosque) => (
                  <HoverCard key={mosque.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h3 className="font-heading-h4 text-heading-h4 text-ink-black">
                          {mosque.name}
                        </h3>
                        {mosque.address && (
                          <p className="font-body-sm text-body-sm text-stone mt-1">{mosque.address}</p>
                        )}
                        <p className="font-label-sm text-label-sm text-secondary mt-2">
                          {formatDistanceMeters(mosque.distanceMeters)}
                          {locationLabel ? ` · ${locationLabel}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <a
                          href={getDirectionsUrl(mosque.latitude, mosque.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 min-h-11 px-3 py-1.5 rounded-full bg-green-soft text-green-deep text-sm font-medium hover:opacity-90"
                        >
                          <span className="material-symbols-outlined text-sm">directions</span>
                          {t('pages.mosqueFinder.directions')}
                        </a>
                        <a
                          href={getOsmUrl(mosque)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 min-h-11 px-3 py-1.5 rounded-full bg-cream-deep text-stone text-sm font-medium hover:bg-green-soft"
                        >
                          <span className="material-symbols-outlined text-sm">map</span>
                          {t('pages.mosqueFinder.viewOnOsm')}
                        </a>
                      </div>
                    </div>
                  </HoverCard>
                ))}
              </div>
            )}
          </AsyncState>
        )}
      </div>

      <AttributionChip
        source="OpenStreetMap · Overpass API"
        url="https://www.openstreetmap.org/copyright"
        page="Mosque Finder"
      />
    </PageShell>
  )
}
