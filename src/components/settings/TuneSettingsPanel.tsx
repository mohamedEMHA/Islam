import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { getPrayerNameKey } from '@/lib/utils/prayerNames'
import { TUNE_PRAYER_ORDER } from '@/types/prayer'

export function TuneSettingsPanel() {
  const { t } = useTranslation()
  const settings = useSettingsStore()
  const update = settings.updateSettings

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-label-sm text-label-sm text-ink-soft mb-2">
          {t('pages.settings.hijriDateAdjustment')}
        </label>
        <input
          type="range"
          min={-2}
          max={2}
          value={settings.hijriAdjustment}
          onChange={(e) => update({ hijriAdjustment: Number(e.target.value) })}
          className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <p className="font-label-sm text-label-sm text-stone mt-1">
          {t('pages.settings.hijriAdjustmentDays', { count: settings.hijriAdjustment })}
        </p>
      </div>
      <details>
        <summary className="font-label-sm text-label-sm text-secondary cursor-pointer hover:underline">
          {t('pages.prayerTimes.manualTune')}
        </summary>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {TUNE_PRAYER_ORDER.map((prayer, i) => (
            <div key={prayer}>
              <label className="text-xs text-stone">{t(getPrayerNameKey(prayer))}</label>
              <input
                type="number"
                value={settings.tune[i]}
                onChange={(e) => {
                  const tune = [...settings.tune]
                  tune[i] = Number(e.target.value)
                  update({ tune })
                }}
                className="w-full bg-transparent border-b border-hairline py-1 text-base focus:outline-none"
              />
            </div>
          ))}
        </div>
      </details>
      <div>
        <label className="block font-label-sm text-label-sm text-ink-soft mb-2">
          {t('pages.settings.adhanVoiceMuezzin')}
        </label>
        <select
          value={settings.notifications.muezzinId}
          onChange={(e) =>
            update({ notifications: { ...settings.notifications, muezzinId: e.target.value } })
          }
          className="w-full bg-transparent border-b border-hairline py-2 font-body-md text-ink-black focus:outline-none"
        >
          <option value="mishary">{t('pages.adhan.muezzins.mishary')}</option>
          <option value="makkah">{t('pages.adhan.muezzins.makkah')}</option>
          <option value="madinah">{t('pages.adhan.muezzins.madinah')}</option>
        </select>
      </div>
    </div>
  )
}
