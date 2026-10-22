import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AttributionChip } from '@/components/content/AttributionChip'
import { HlsLivePlayer } from '@/components/live/HlsLivePlayer'
import { HoverCard } from '@/components/motion/HoverCard'
import { TabFade } from '@/components/motion/TabFade'
import { PageShell } from '@/components/ui/PageShell'
import { TabPills } from '@/components/ui/TabPills'
import { AsyncState } from '@/components/ui/AsyncState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useLiveStreamSources } from '@/lib/hooks/useLiveStreamSources'
import { LIVE_ATTRIBUTION, type LiveTab } from '@/lib/liveStreams'

const STREAM_META: Record<
  LiveTab,
  { titleKey: 'makkahTitle' | 'madinahTitle'; noteKey: 'makkahNote' | 'madinahNote' }
> = {
  makkah: {
    titleKey: 'makkahTitle',
    noteKey: 'makkahNote',
  },
  madinah: {
    titleKey: 'madinahTitle',
    noteKey: 'madinahNote',
  },
}

export function LivePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<LiveTab>('makkah')
  const meta = STREAM_META[tab]
  const { data: sources = [], isLoading, isError, refetch } = useLiveStreamSources(tab)
  const streamTitle = t(`pages.live.${meta.titleKey}`)
  const showPlayer = sources.length > 0

  return (
    <PageShell title={t('pages.live.title')} subtitle={t('pages.live.subtitle')}>
      <TabPills
        tabs={[
          { id: 'makkah', label: t('pages.live.tabs.makkah') },
          { id: 'madinah', label: t('pages.live.tabs.madinah') },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-6"
      />

      <TabFade activeKey={tab}>
        <AsyncState
          loading={isLoading}
          error={isError ? t('pages.live.unavailable') : null}
          onRetry={() => void refetch()}
          loadingFallback={<Skeleton className="aspect-video w-full rounded-xl mb-4" />}
          empty={!isLoading && !isError && !showPlayer}
          emptyFallback={
            <HoverCard className="p-8 text-center mb-4">
              <p className="font-body-md text-body-md text-stone">{t('pages.live.emptySources')}</p>
            </HoverCard>
          }
        >
          <HoverCard className="p-0 overflow-hidden">
            <div
              className="aspect-video bg-ink-black relative overflow-hidden"
              aria-label={t('pages.live.playerLabel')}
            >
              {showPlayer && (
                <HlsLivePlayer key={`${tab}:${sources[0]}`} sources={sources} title={streamTitle} />
              )}
            </div>
          </HoverCard>
        </AsyncState>

        <p className="font-body-md text-body-md text-stone mt-4">{t(`pages.live.${meta.noteKey}`)}</p>
      </TabFade>

      <div className="mt-8">
        <AttributionChip
          source={LIVE_ATTRIBUTION.source}
          url={LIVE_ATTRIBUTION.url}
          page="Live"
        />
      </div>
    </PageShell>
  )
}
