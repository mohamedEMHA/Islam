import { useTranslation } from 'react-i18next'
import { useQibla } from '@/lib/hooks/useQibla'
import { calculateDistanceToKaaba } from '@/lib/utils/qibla'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { Button, ButtonLink } from '@/components/ui/Button'
import { AttributionChip } from '@/components/content/AttributionChip'
import { AsyncState } from '@/components/ui/AsyncState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'

export function QiblaPage() {
  const { t } = useTranslation()
  const { formatInteger } = useLocaleFormat()
  const {
    bearing,
    needleRotation,
    compassSupported,
    needsCompassPermission,
    permission,
    requestCompassPermission,
    compassUnavailable,
    location,
    loading,
    error,
    refetch,
  } = useQibla()
  const distance = location
    ? calculateDistanceToKaaba(location.latitude, location.longitude)
    : null

  if (!location) {
    return (
      <PageShell
        title={t('pages.qibla.title')}
        subtitle={t('pages.qibla.subtitle')}
      >
        <HoverCard className="flex flex-col items-center py-12 px-6 text-center">
          <span className="material-symbols-outlined text-4xl text-stone mb-4">location_off</span>
          <p className="font-body-md text-body-md text-stone mb-6">{t('pages.qibla.noLocation')}</p>
          <ButtonLink variant="primary" size="sm" to="/settings">
            {t('pages.qibla.setLocation')}
          </ButtonLink>
        </HoverCard>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={t('pages.qibla.title')}
      subtitle={t('pages.qibla.subtitle')}
      location={location.city}
    >
      <AsyncState
        loading={loading}
        error={error}
        onRetry={refetch}
        errorMessage={error ?? t('errors.qibla')}
        loadingFallback={
          <HoverCard className="flex flex-col items-center py-12 px-6">
            <Skeleton className="w-[min(18rem,100%)] aspect-square rounded-full" />
            <Skeleton className="w-24 h-10 mt-10" />
            <Skeleton className="w-40 h-5 mt-2" />
          </HoverCard>
        }
      >
        <HoverCard className="flex flex-col items-center py-12 px-6">
          <div className="relative w-[min(18rem,100%)] aspect-square">
            <div className="absolute inset-0 rounded-full border-2 border-hairline" />
            <div className="absolute inset-6 rounded-full border border-hairline/50" />
            <div className="absolute inset-12 rounded-full border border-dashed border-hairline/30" />
            {['N', 'E', 'S', 'W'].map((dir, i) => (
              <span
                key={dir}
                className="absolute font-label-sm text-label-sm text-stone font-semibold"
                style={{
                  top: i === 0 ? '8px' : i === 2 ? 'auto' : '50%',
                  bottom: i === 2 ? '8px' : 'auto',
                  left: i === 3 ? '8px' : i === 1 ? 'auto' : '50%',
                  right: i === 1 ? '8px' : 'auto',
                  transform: i === 1 || i === 3 ? 'translateY(-50%)' : 'translateX(-50%)',
                }}
              >
                {dir}
              </span>
            ))}
            <div
              className="absolute inset-0 flex items-center justify-center compass-needle"
              style={{ transform: `rotate(${needleRotation}deg)` }}
            >
              <div className="relative flex flex-col items-center">
                <span className="text-xl mb-1" aria-hidden>
                  🕋
                </span>
                <div className="w-1.5 h-24 bg-secondary rounded-full relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-secondary" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center space-y-2">
            <p className="font-display-h1-mobile text-display-h1-mobile font-light text-ink-black">
              {Math.round(bearing)}°
            </p>
            <p className="font-body-md text-body-md text-stone">{t('pages.qibla.bearingFromNorth')}</p>
            {distance !== null && (
              <p className="font-body-md text-body-md text-stone">
                {t('pages.qibla.distanceToMakkah', { distance: formatInteger(Math.round(distance)) })}
              </p>
            )}
          </div>

          {(needsCompassPermission || permission === 'denied') && (
            <div className="mt-6 text-center space-y-3">
              {needsCompassPermission && (
                <>
                  <p className="font-body-md text-body-md text-stone">{t('pages.qibla.compassPrompt')}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => void requestCompassPermission()}
                  >
                    {t('pages.qibla.enableCompass')}
                  </Button>
                </>
              )}
              {permission === 'denied' && (
                <p className="font-label-sm text-label-sm text-error">{t('pages.qibla.compassDenied')}</p>
              )}
            </div>
          )}

          {compassSupported && permission === 'granted' && (
            <p className="mt-6 font-label-sm text-label-sm text-stone text-center">
              {t('pages.qibla.usingCompass')}
            </p>
          )}

          {compassUnavailable && permission === 'granted' && (
            <p className="mt-6 font-label-sm text-label-sm text-stone text-center max-w-sm">
              {t('pages.qibla.compassUnavailable')}
            </p>
          )}
        </HoverCard>
      </AsyncState>

      <div className="mt-8">
        <AttributionChip
          source="AlAdhan API"
          url="https://aladhan.com/prayer-times-api"
          page="Qibla Direction"
        />
      </div>
    </PageShell>
  )
}
