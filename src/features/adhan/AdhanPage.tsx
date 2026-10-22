import { useCallback, useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { useTranslation } from 'react-i18next'

import { PageShell } from '@/components/ui/PageShell'

import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'

import { Button } from '@/components/ui/Button'

import { StitchSwitch } from '@/components/ui/StitchSwitch'

import { useSettingsStore } from '@/lib/stores/settingsStore'

import { isSilentPrayerReminders } from '@/lib/notifications/prayerReminder'

import {

  ADHAN_MUEZZINS,

  clearAdhanError,

  getAdhanErrorId,

  getAdhanLoadingId,

  getAdhanPlayingId,

  playAdhan,

  stopAdhan,

  subscribeAdhanPlayer,

} from '@/lib/hooks/useAdhanPlayer'



function readPlayerState() {

  return {

    playingId: getAdhanPlayingId(),

    loadingId: getAdhanLoadingId(),

    errorId: getAdhanErrorId(),

  }

}



export function AdhanPage() {

  const { t } = useTranslation()

  const settings = useSettingsStore()

  const update = settings.updateSettings

  const selectedId = settings.notifications.muezzinId

  const silentNotifications = isSilentPrayerReminders(settings.notifications)

  const [playerState, setPlayerState] = useState(readPlayerState)



  useEffect(() => {

    return subscribeAdhanPlayer(() => setPlayerState(readPlayerState()))

  }, [])



  const handleSelect = useCallback(

    (muezzinId: string) => {

      update({ notifications: { ...settings.notifications, muezzinId } })

    },

    [settings.notifications, update],

  )



  const handlePlay = useCallback(

    (muezzinId: string) => {

      clearAdhanError()

      if (playerState.playingId === muezzinId) {

        stopAdhan()

        return

      }

      void playAdhan(muezzinId)

    },

    [playerState.playingId],

  )



  const { playingId, loadingId, errorId } = playerState



  return (

    <PageShell

      title={t('pages.adhan.title')}

      subtitle={t('pages.adhan.subtitle')}

    >

      <div className="space-y-8">

        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">

          {t('pages.adhan.intro')}

        </p>



        {errorId && (

          <p

            role="alert"

            className="font-body-md text-body-md text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3"

          >

            {t('pages.adhan.playbackError')}

          </p>

        )}



        <HoverCard className="p-4 border border-hairline dark:border-dark-border">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[22px] shrink-0 text-secondary dark:text-dark-green"
              aria-hidden
            >
              {silentNotifications ? 'notifications_off' : 'notifications_active'}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-medium text-base leading-snug text-ink-black dark:text-dark-text">
                {t('pages.adhan.silentNotificationsTitle')}
              </h2>
              <p className="mt-0.5 font-label-sm text-label-sm leading-snug text-ink-soft dark:text-dark-text-secondary">
                {silentNotifications
                  ? t('pages.adhan.silentNotificationsOnDesc')
                  : t('pages.adhan.silentNotificationsOffDesc')}
              </p>
            </div>
            <StitchSwitch
              checked={silentNotifications}
              onChange={(checked) =>
                update({ notifications: { ...settings.notifications, silentNotifications: checked } })
              }
              aria-label={t('pages.adhan.silentNotificationsTitle')}
            />
          </div>
        </HoverCard>



        <StaggerList className="space-y-4">

          {ADHAN_MUEZZINS.map((muezzin) => {

            const isSelected = selectedId === muezzin.id

            const isPlaying = playingId === muezzin.id

            const isLoading = loadingId === muezzin.id

            const hasError = errorId === muezzin.id



            return (

              <StaggerListItem key={muezzin.id}>

              <HoverCard

                className={`p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border ${

                  isSelected

                    ? 'border-secondary dark:border-dark-green'

                    : 'border-hairline dark:border-dark-border'

                }`}

              >

                <div className="flex items-start gap-4">

                  <span

                    className={`material-symbols-outlined text-2xl mt-0.5 ${

                      isPlaying

                        ? 'text-secondary dark:text-dark-green animate-pulse'

                        : hasError

                          ? 'text-red-600 dark:text-red-400'

                          : 'text-secondary dark:text-dark-green'

                    }`}

                    aria-hidden

                  >

                    {isPlaying ? 'volume_up' : hasError ? 'error' : 'notifications_active'}

                  </span>

                  <div>

                    <p className="font-body-lg text-body-lg font-medium text-ink-black dark:text-dark-text">

                      {t(muezzin.labelKey)}

                    </p>

                    <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mt-1">

                      {t(muezzin.descKey)}

                    </p>

                    {isSelected && (

                      <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green mt-2">

                        {silentNotifications

                          ? t('pages.adhan.selectedForSilentReminders')

                          : t('pages.adhan.selectedForReminders')}

                      </p>

                    )}

                    {hasError && (

                      <p className="font-label-sm text-label-sm text-red-600 dark:text-red-400 mt-2">

                        {t('pages.adhan.playbackErrorShort')}

                      </p>

                    )}

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <Button

                    type="button"

                    variant={isSelected ? 'primary' : 'secondary'}

                    size="sm"

                    onClick={() => handleSelect(muezzin.id)}

                  >

                    {isSelected ? t('pages.adhan.selected') : t('pages.adhan.select')}

                  </Button>

                  <Button

                    type="button"

                    variant="secondary"

                    size="sm"

                    onClick={() => handlePlay(muezzin.id)}

                    disabled={isLoading}

                    className="flex items-center gap-2"

                    aria-busy={isLoading}

                  >

                    <span className="material-symbols-outlined text-sm" aria-hidden>

                      {isLoading ? 'hourglass_top' : isPlaying ? 'stop' : 'play_arrow'}

                    </span>

                    {isLoading

                      ? t('pages.adhan.loading')

                      : isPlaying

                        ? t('pages.adhan.stop')

                        : t('pages.adhan.play')}

                  </Button>

                </div>

              </HoverCard>

              </StaggerListItem>

            )

          })}

        </StaggerList>



        <HoverCard className="p-5 md:p-6 border border-hairline dark:border-dark-border">

          <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-3">

            {t('pages.adhan.remindersTitle')}

          </h2>

          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-4">

            {t('pages.adhan.remindersBody')}

          </p>

          <Link

            to="/settings"

            className="font-label-sm text-label-sm text-secondary dark:text-dark-green hover:underline"

          >

            {t('pages.adhan.openSettings')}

          </Link>

        </HoverCard>

      </div>

    </PageShell>

  )

}

