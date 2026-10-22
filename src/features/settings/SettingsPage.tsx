import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { useConsentStore } from '@/lib/stores/consentStore'
import { isAnalyticsConfigured, unloadAnalytics } from '@/lib/analytics'
import { CALCULATION_METHODS, HIGH_LATITUDE_RULES } from '@/types/settings'
import { StitchSwitch } from '@/components/ui/StitchSwitch'
import { Button } from '@/components/ui/Button'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { TuneSettingsPanel } from '@/components/settings/TuneSettingsPanel'
import { isSilentPrayerReminders } from '@/lib/notifications/prayerReminder'
import { playAdhan, unlockAdhanAudio } from '@/lib/hooks/useAdhanPlayer'
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/hooks/usePrayerNotifications'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { useDetectLocation } from '@/lib/hooks/useDetectLocation'
import { SUPPORTED_LANGUAGES } from '@/i18n/config'
import i18n, { ensureLocaleLoaded } from '@/i18n'
import { switchLocalePath } from '@/lib/hooks/useLocalizedNavigate'
import type { LocaleCode } from '@/lib/i18n/localizedPath'

export function SettingsPage() {
  const { t } = useTranslation()
  const { hash, pathname } = useLocation()
  const navigate = useNavigate()
  const settings = useSettingsStore()
  const update = settings.updateSettings
  const analyticsConsent = useConsentStore((s) => s.analytics)
  const setAnalyticsConsent = useConsentStore((s) => s.setAnalyticsConsent)
  const resetConsent = useConsentStore((s) => s.resetConsent)
  const analyticsAvailable = isAnalyticsConfigured()
  const adhanEnabled =
    settings.notifications.fajr ||
    settings.notifications.dhuhr ||
    settings.notifications.asr ||
    settings.notifications.maghrib ||
    settings.notifications.isha
  const silentNotifications = isSilentPrayerReminders(settings.notifications)
  const { coords, requestLocation, loading: geoLoading, error: geoError } = useGeolocation()
  const { saveCoords } = useDetectLocation()
  const [manualLat, setManualLat] = useState(String(settings.location?.latitude ?? ''))
  const [manualLng, setManualLng] = useState(String(settings.location?.longitude ?? ''))
  const [savingLocation, setSavingLocation] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission)
  const notificationsSupported = typeof Notification !== 'undefined'
  const anyNotificationEnabled =
    settings.notifications.fajr ||
    settings.notifications.dhuhr ||
    settings.notifications.asr ||
    settings.notifications.maghrib ||
    settings.notifications.isha ||
    settings.notifications.dailyHadith ||
    settings.notifications.whiteDays ||
    settings.notifications.monThuFasting

  useEffect(() => {
    if (!notificationsSupported) return
    const syncPermission = () => setNotificationPermission(getNotificationPermission())
    syncPermission()
    let permissionStatus: PermissionStatus | null = null
    void navigator.permissions
      ?.query({ name: 'notifications' as PermissionName })
      .then((status) => {
        permissionStatus = status
        status.onchange = syncPermission
      })
      .catch(() => {})
    return () => {
      if (permissionStatus) permissionStatus.onchange = null
    }
  }, [notificationsSupported])

  const handleNotificationEnable = async (checked: boolean) => {
    if (!checked || !notificationsSupported) return
    const granted = await requestNotificationPermission()
    setNotificationPermission(getNotificationPermission())
    if (granted && !isSilentPrayerReminders(settings.notifications)) {
      unlockAdhanAudio(settings.notifications.muezzinId)
    }
  }

  useEffect(() => {
    if (hash !== '#location') return
    const el = document.getElementById('location')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash])

  useEffect(() => {
    if (!coords) return
    let active = true
    setSavingLocation(true)
    void saveCoords(coords.latitude, coords.longitude)
      .then(() => {
        if (!active) return
        setManualLat(String(coords.latitude))
        setManualLng(String(coords.longitude))
      })
      .finally(() => {
        if (active) setSavingLocation(false)
      })
    return () => {
      active = false
    }
  }, [coords, saveCoords])

  const handleSaveManualLocation = () => {
    const latitude = Number(manualLat)
    const longitude = Number(manualLng)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return
    setSavingLocation(true)
    void saveCoords(latitude, longitude).finally(() => setSavingLocation(false))
  }

  const locationLabel = settings.location?.city
    ? settings.location.country
      ? `${settings.location.city}, ${settings.location.country}`
      : settings.location.city
    : settings.location
      ? `${settings.location.latitude.toFixed(4)}, ${settings.location.longitude.toFixed(4)}`
      : t('common.yourLocation')
  return (
    <div>
      <div className="w-full px-margin-mobile md:px-8 xl:px-margin-desktop py-8 md:py-10">
        <header className="mb-8 md:mb-10">
          <h1 className="font-heading-h2 text-heading-h2 text-ink-black dark:text-dark-text mb-2">
            {t('pages.settings.title')}
          </h1>
          <p className="font-body-md text-body-md text-stone">
            {t('pages.settings.subtitle')}
          </p>
        </header>

        <StaggerList className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <StaggerListItem className="md:col-span-7 bg-paper-white border border-hairline rounded-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-hairline pb-4">
              <span className="material-symbols-outlined text-secondary text-2xl fill">schedule</span>
              <h2 className="font-heading-h3 text-heading-h3 text-ink-black">{t('pages.settings.prayerCalculation')}</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block font-label-sm text-label-sm text-ink-soft mb-2">{t('pages.prayerTimes.method')}</label>
                <div className="relative">
                  <select
                    value={settings.calculationMethod}
                    onChange={(e) => update({ calculationMethod: Number(e.target.value) })}
                    className="block w-full appearance-none bg-transparent border-0 border-b border-hairline focus:border-primary focus:ring-0 text-ink-black py-2 ps-0 pe-8 font-body-md transition-colors"
                  >
                    {CALCULATION_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center text-stone">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-stone mt-2">
                  {t('pages.prayerTimes.methodHint')}
                </p>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-ink-soft mb-2">{t('pages.prayerTimes.asrMethod')}</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="asr_method"
                      checked={settings.madhab === 0}
                      onChange={() => update({ madhab: 0 })}
                      className="text-primary border-hairline focus:ring-primary accent-primary"
                    />
                    <span className="font-body-md text-body-md text-ink-black">{t('pages.prayerTimes.asrStandard')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="asr_method"
                      checked={settings.madhab === 1}
                      onChange={() => update({ madhab: 1 })}
                      className="text-primary border-hairline focus:ring-primary accent-primary"
                    />
                    <span className="font-body-md text-body-md text-ink-black">{t('pages.prayerTimes.asrHanafi')}</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-ink-soft mb-2">{t('pages.prayerTimes.highLatitude')}</label>
                <div className="relative">
                  <select
                    value={settings.highLatitudeRule}
                    onChange={(e) => update({ highLatitudeRule: Number(e.target.value) })}
                    className="block w-full appearance-none bg-transparent border-0 border-b border-hairline focus:border-primary focus:ring-0 text-ink-black py-2 ps-0 pe-8 font-body-md transition-colors"
                  >
                    {HIGH_LATITUDE_RULES.map((rule) => (
                      <option key={rule.id} value={rule.id}>{rule.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center text-stone">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
              <TuneSettingsPanel />
            </div>
          </StaggerListItem>

          <StaggerListItem className="md:col-span-5 flex flex-col gap-gutter">
            <section className="bg-paper-white border border-hairline rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4 border-b border-hairline pb-4">
                <span className="material-symbols-outlined text-secondary text-2xl">palette</span>
                <h2 className="font-heading-h3 text-heading-h3 text-ink-black">{t('pages.settings.appearance')}</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-ink-black">{t('pages.settings.darkMode')}</span>
                  <StitchSwitch
                    checked={settings.theme === 'dark'}
                    onChange={(checked) => update({ theme: checked ? 'dark' : 'light' })}
                    aria-label={t('pages.settings.darkMode')}
                  />
                </div>
                <div>
                  <label className="block font-body-md text-body-md text-ink-black mb-2">{t('pages.settings.arabicFontSize')}</label>
                  <input
                    type="range"
                    min={80}
                    max={150}
                    value={settings.quranFontSize}
                    onChange={(e) => update({ quranFontSize: Number(e.target.value) })}
                    className="w-full h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-stone text-sm mt-1">
                    <span>A</span>
                    <span className="text-lg">A</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-paper-white border border-hairline rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4 border-b border-hairline pb-4">
                <span className="material-symbols-outlined text-secondary text-2xl">language</span>
                <h2 className="font-heading-h3 text-heading-h3 text-ink-black">{t('pages.settings.language')}</h2>
              </div>
              <div className="relative mt-2">
                <select
                  value={settings.language}
                  onChange={(e) => {
                    const next = e.target.value as LocaleCode
                    update({ language: next })
                    void ensureLocaleLoaded(next).then(() => {
                      void i18n.changeLanguage(next)
                    })
                    navigate(switchLocalePath(pathname, next), { replace: true })
                  }}
                  className="block w-full appearance-none bg-transparent border-0 border-b border-hairline focus:border-primary focus:ring-0 text-ink-black py-2 ps-0 pe-8 font-body-md transition-colors"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center text-stone">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </section>
          </StaggerListItem>

          <StaggerListItem className="md:col-span-12 bg-paper-white border border-hairline rounded-lg p-6 md:p-8">
            <div id="location" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-6 border-b border-hairline pb-4">
              <span className="material-symbols-outlined text-secondary text-2xl">location_on</span>
              <h2 className="font-heading-h3 text-heading-h3 text-ink-black">{t('pages.settings.location')}</h2>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-label-sm text-label-sm text-ink-soft mb-1">{t('pages.settings.currentLocation')}</p>
                  <p className="font-body-md text-body-md text-ink-black">{locationLabel}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={requestLocation}
                  disabled={geoLoading || savingLocation}
                >
                  {geoLoading || savingLocation ? t('pages.settings.locating') : t('pages.settings.useMyLocation')}
                </Button>
              </div>
              {geoError && <p className="text-sm text-error">{geoError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-ink-soft mb-2">{t('pages.settings.latitude')}</label>
                  <input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full bg-transparent border-b border-hairline py-2 font-body-md text-ink-black focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-ink-soft mb-2">{t('pages.settings.longitude')}</label>
                  <input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="w-full bg-transparent border-b border-hairline py-2 font-body-md text-ink-black focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <Button type="button" onClick={handleSaveManualLocation} disabled={savingLocation}>
                {t('pages.settings.saveLocation')}
              </Button>
            </div>
            </div>
          </StaggerListItem>

          <StaggerListItem className="md:col-span-12 bg-paper-white border border-hairline rounded-lg p-6 md:p-8 mt-gutter">
            <div className="flex items-center gap-3 mb-6 border-b border-hairline pb-4">
              <span className="material-symbols-outlined text-secondary text-2xl fill">notifications</span>
              <h2 className="font-heading-h3 text-heading-h3 text-ink-black">{t('pages.settings.notifications')}</h2>
            </div>
            {!notificationsSupported && (
              <p className="mb-4 text-sm text-stone">{t('pages.settings.notificationsUnsupported')}</p>
            )}
            {notificationsSupported && notificationPermission === 'denied' && anyNotificationEnabled && (
              <p className="mb-4 text-sm text-error">{t('pages.settings.notificationsBlocked')}</p>
            )}
            {silentNotifications && adhanEnabled && (
              <p className="mb-4 text-sm text-secondary dark:text-dark-green">
                {t('pages.settings.silentNotificationsActive')}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-between items-start border-b md:border-b-0 border-hairline pb-4 md:pb-0">
                <div>
                  <h3 className="font-semibold text-ink-black">{t('pages.settings.adhanReminders')}</h3>
                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                    {t('pages.settings.adhanRemindersDesc')}
                  </p>
                </div>
                <StitchSwitch
                  checked={adhanEnabled}
                  onChange={async (checked) => {
                    await handleNotificationEnable(checked)
                    update({
                      notifications: {
                        ...settings.notifications,
                        fajr: checked,
                        dhuhr: checked,
                        asr: checked,
                        maghrib: checked,
                        isha: checked,
                      },
                    })
                  }}
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-ink-black">{t('pages.settings.dailyHadith')}</h3>
                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                    {t('pages.settings.dailyHadithDesc')}
                  </p>
                </div>
                <StitchSwitch
                  checked={settings.notifications.dailyHadith ?? false}
                  onChange={async (checked) => {
                    await handleNotificationEnable(checked)
                    update({ notifications: { ...settings.notifications, dailyHadith: checked } })
                  }}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-between items-start border-b md:border-b-0 border-hairline pb-4 md:pb-0">
                <div>
                  <h3 className="font-semibold text-ink-black dark:text-dark-text">
                    {t('pages.settings.silentNotifications')}
                  </h3>
                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                    {t('pages.settings.silentNotificationsDesc')}
                  </p>
                </div>
                <StitchSwitch
                  checked={silentNotifications}
                  onChange={(checked) => {
                    update({ notifications: { ...settings.notifications, silentNotifications: checked } })
                    if (!checked) {
                      unlockAdhanAudio(settings.notifications.muezzinId)
                    }
                  }}
                  aria-label={t('pages.settings.silentNotifications')}
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-ink-black">{t('pages.settings.whiteDays')}</h3>
                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                    {t('pages.settings.whiteDaysDesc')}
                  </p>
                </div>
                <StitchSwitch
                  checked={settings.notifications.whiteDays}
                  onChange={async (checked) => {
                    await handleNotificationEnable(checked)
                    update({ notifications: { ...settings.notifications, whiteDays: checked } })
                  }}
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-ink-black">{t('pages.settings.monThuFasting')}</h3>
                  <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                    {t('pages.settings.monThuFastingDesc')}
                  </p>
                </div>
                <StitchSwitch
                  checked={settings.notifications.monThuFasting}
                  onChange={async (checked) => {
                    await handleNotificationEnable(checked)
                    update({ notifications: { ...settings.notifications, monThuFasting: checked } })
                  }}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-hairline grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((p) => (
                <div key={p} className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-ink-soft capitalize">{p}</span>
                  <StitchSwitch
                    checked={settings.notifications[p]}
                    onChange={async (checked) => {
                      await handleNotificationEnable(checked)
                      update({ notifications: { ...settings.notifications, [p]: checked } })
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  void playAdhan(settings.notifications.muezzinId)
                }}
                className="font-label-sm text-label-sm text-secondary hover:underline"
              >
                {t('pages.settings.previewAdhan')}
              </button>
              <LocalizedLink
                to="/adhan"
                className="font-label-sm text-label-sm text-secondary hover:underline"
              >
                {t('pages.settings.adhanLibrary')}
              </LocalizedLink>
            </div>
          </StaggerListItem>

          <StaggerListItem className="md:col-span-12 bg-paper-white border border-hairline rounded-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4 border-b border-hairline pb-4">
              <span className="material-symbols-outlined text-secondary text-2xl">cookie</span>
              <h2 className="font-heading-h3 text-heading-h3 text-ink-black">{t('pages.settings.privacyPrefs')}</h2>
            </div>
            <div className="space-y-4 mb-6">
              <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
                {t('pages.settings.privacyPrefsDesc')}
              </p>
              {analyticsAvailable ? (
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-ink-black dark:text-dark-text">
                      {t('pages.settings.analyticsLabel')}
                    </h3>
                    <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary">
                      {t('pages.settings.analyticsDesc')}
                    </p>
                  </div>
                  <StitchSwitch
                    checked={analyticsConsent === 'accepted'}
                    onChange={(checked) => {
                      setAnalyticsConsent(checked ? 'accepted' : 'rejected')
                      if (!checked) {
                        unloadAnalytics()
                      }
                    }}
                    aria-label={t('pages.settings.analyticsLabel')}
                  />
                </div>
              ) : (
                <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                  {t('pages.settings.analyticsUnavailable')}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  resetConsent()
                  unloadAnalytics()
                }}
                className="font-label-sm text-label-sm text-secondary hover:underline"
              >
                {t('pages.settings.resetConsent')}
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4 border-b border-hairline pb-4">
              <span className="material-symbols-outlined text-secondary text-2xl">gavel</span>
              <h2 className="font-heading-h3 text-heading-h3 text-ink-black">{t('pages.settings.legalAccount')}</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <LocalizedLink to="/app/privacy" className="font-label-sm text-label-sm text-secondary hover:underline">
                {t('pages.settings.privacyPolicy')}
              </LocalizedLink>
              <LocalizedLink to="/app/sources" className="font-label-sm text-label-sm text-secondary hover:underline">
                {t('pages.settings.sourcesAttribution')}
              </LocalizedLink>
              <LocalizedLink to="/app/terms" className="font-label-sm text-label-sm text-secondary hover:underline">
                {t('pages.settings.termsOfService')}
              </LocalizedLink>
            </div>
          </StaggerListItem>
        </StaggerList>
      </div>
    </div>
  )
}
