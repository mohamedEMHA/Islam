import { LocalizedLink } from '@/components/routing/LocalizedLink'

import { useTranslation } from 'react-i18next'

import { usePrayerTimes } from '@/lib/hooks/usePrayerTimes'

import { useLocaleFormat } from '@/lib/hooks/useLocaleFormat'

import { useSettingsStore } from '@/lib/stores/settingsStore'

import { PageHeader } from '@/components/ui/PageHeader'

import { PrayerHeroCard } from '@/components/ui/PrayerHeroCard'

import { AttributionChip } from '@/components/content/AttributionChip'

import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'

import { PrayerTimesPageSkeleton } from '@/components/ui/Skeleton'

import { getPrayerNameKey } from '@/lib/utils/prayerNames'

import { PRAYER_ORDER } from '@/types/prayer'

import { CALCULATION_METHODS, HIGH_LATITUDE_RULES } from '@/types/settings'

import { cn } from '@/lib/utils/format'

import { HIJRI_MONTH_KEYS } from '@/lib/utils/islamicEvents'



const INSPIRATION_IMG = '/brand/prayer_inspiration.webp'



export function PrayerTimesPage() {

  const { t } = useTranslation()

  const { formatTime12, formatCountdown, formatNumericString } = useLocaleFormat()

  const { data, nextPrayer, loading, error } = usePrayerTimes()

  const locationCity = useSettingsStore((s) => s.location?.city)



  if (loading) {

    return <PrayerTimesPageSkeleton />

  }



  if (error || !data || !nextPrayer) {

    return (

      <div className="px-margin-mobile md:px-8 xl:px-margin-desktop py-8 md:py-10">

        <p className="text-error">{error ?? t('errors.prayerTimes')}</p>

      </div>

    )

  }



  const currentPrayer = nextPrayer.name

  const displayPrayers = PRAYER_ORDER

  const hijriMonthKey =
    HIJRI_MONTH_KEYS[data.date.hijri.month.number] ?? HIJRI_MONTH_KEYS[1]



  return (

    <div>

      <div className="w-full px-margin-mobile md:px-8 xl:px-margin-desktop py-8 md:py-10">

        <PageHeader

          title={t('pages.prayerTimes.title')}

          location={locationCity ?? t('common.yourLocation')}

          actions={

            <LocalizedLink

              to="/hijri_calendar"

              className="flex items-center gap-2 border border-hairline rounded-full px-4 py-2 font-label-sm text-label-sm text-ink-soft hover:bg-surface-container-high transition-colors"

            >

              <span className="material-symbols-outlined text-[18px]">calendar_month</span>

              {t('common.today')}

            </LocalizedLink>

          }

        />



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 flex flex-col gap-8">

            <PrayerHeroCard

              prayerName={t(getPrayerNameKey(nextPrayer.name))}

              prayerTime={formatTime12(nextPrayer.time)}

              countdownLabel={formatCountdown(nextPrayer.countdownSeconds)}

              progress={nextPrayer.progress}

            />



            <div className="bg-paper-white rounded-xl border border-hairline p-6">

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-hairline">

                <h4 className="font-label-sm text-label-sm text-ink-soft uppercase tracking-wider">

                  {t('pages.prayerTimes.schedule')}

                </h4>

                <div className="flex items-center gap-1 text-secondary bg-green-soft px-2 py-1 rounded">

                  <span className="material-symbols-outlined text-[14px]">verified</span>

                  <span className="text-[11px] font-bold uppercase tracking-wide">{t('common.verifiedSource')}</span>

                </div>

              </div>

              <StaggerList className="flex flex-col gap-2">

                {displayPrayers.map((prayer, index) => {

                  const isCurrent = currentPrayer === prayer

                  const time = data.timings[prayer as keyof typeof data.timings]

                  return (

                    <StaggerListItem key={prayer}>

                    <div

                      className={cn(

                        'flex justify-between items-center p-4 rounded-lg transition-colors',

                        isCurrent

                          ? 'bg-green-soft border border-secondary shadow-sm relative overflow-hidden'

                          : 'hover:bg-surface-container-high',

                        index > 0 && !isCurrent && 'border-t border-hairline',

                      )}

                    >

                      {isCurrent && (

                        <div className="absolute start-0 top-0 bottom-0 w-1 bg-secondary" />

                      )}

                      <span

                        className={cn(

                          'font-body-lg text-body-lg flex items-center gap-2',

                          isCurrent ? 'font-bold text-primary' : 'text-stone',

                        )}

                      >

                        {t(getPrayerNameKey(prayer))}

                        {isCurrent && (

                          <span className="material-symbols-outlined text-[18px] text-secondary">

                            notifications_active

                          </span>

                        )}

                      </span>

                      <span className={cn('font-body-lg text-body-lg', isCurrent ? 'font-bold text-primary' : 'text-ink-black')}>

                        {formatTime12(time)}

                      </span>

                    </div>

                    </StaggerListItem>

                  )

                })}

              </StaggerList>

            </div>

          </div>



          <div className="lg:col-span-4 flex flex-col gap-8">

            <CalculationPanel />



            <LocalizedLink

              to="/#daily-reflection"

              className="block rounded-xl overflow-hidden border border-hairline relative h-48 group hover:border-secondary transition-colors"

              aria-label={t('pages.prayerTimes.dailyInspiration')}

            >

              <img
                src={INSPIRATION_IMG}
                alt={t('pages.prayerTimes.dailyInspiration')}
                width={640}
                height={192}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-ink-black/60 to-transparent flex items-end p-4">

                <span className="font-label-sm text-label-sm text-white">{t('pages.prayerTimes.dailyInspiration')}</span>

              </div>

            </LocalizedLink>



            <LocalizedLink

              to="/hijri_calendar"

              className="flex items-center justify-between bg-paper-white rounded-xl border border-hairline p-4 hover:border-secondary transition-colors"

            >

              <span className="font-label-sm text-label-sm text-ink-soft">{t('pages.prayerTimes.monthlySchedule')}</span>

              <span className="material-symbols-outlined text-stone rtl:rotate-180">arrow_forward</span>

            </LocalizedLink>



            <p className="font-body-md text-body-md text-stone">

              {t('pages.prayerTimes.hijriDateLine', {
                day: formatNumericString(data.date.hijri.day),
                month: t(hijriMonthKey),
                year: formatNumericString(data.date.hijri.year),
              })}

            </p>

          </div>

        </div>



        <div className="mt-8">

          <AttributionChip

            source="AlAdhan API"

            url="https://aladhan.com/prayer-times-api"

            onReport={() => window.open('mailto:support@islam.house?subject=Prayer%20Times%20Issue')}

          />

        </div>

      </div>

    </div>

  )

}



function CalculationPanel() {

  const { t } = useTranslation()

  const calculationMethod = useSettingsStore((s) => s.calculationMethod)

  const madhab = useSettingsStore((s) => s.madhab)

  const highLatitudeRule = useSettingsStore((s) => s.highLatitudeRule)

  const updateSettings = useSettingsStore((s) => s.updateSettings)

  return (

    <div className="bg-paper-white rounded-xl border border-hairline p-6">

      <h4 className="font-label-sm text-label-sm text-ink-soft uppercase tracking-wider mb-6 pb-2 border-b border-hairline">

        {t('pages.prayerTimes.calculationSettings')}

      </h4>

      <div className="flex flex-col gap-6">

        <div>

          <label className="block font-label-sm text-label-sm text-stone mb-2">{t('pages.prayerTimes.method')}</label>

          <select

            value={calculationMethod}

            onChange={(e) => updateSettings({ calculationMethod: Number(e.target.value) })}

            className="w-full bg-transparent border-0 border-b border-hairline focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-ink-black"

          >

            {CALCULATION_METHODS.map((m) => (

              <option key={m.id} value={m.id}>{m.name}</option>

            ))}

          </select>

        </div>

        <div>

          <label className="block font-label-sm text-label-sm text-stone mb-2">{t('pages.prayerTimes.asrMethod')}</label>

          <select

            value={madhab}

            onChange={(e) => updateSettings({ madhab: Number(e.target.value) as 0 | 1 })}

            className="w-full bg-transparent border-0 border-b border-hairline focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-ink-black"

          >

            <option value={0}>{t('pages.prayerTimes.asrStandard')}</option>

            <option value={1}>{t('pages.prayerTimes.asrHanafi')}</option>

          </select>

        </div>

        <div>
          <label className="block font-label-sm text-label-sm text-stone mb-2">{t('pages.prayerTimes.highLatitude')}</label>
          <select
            value={highLatitudeRule}
            onChange={(e) => updateSettings({ highLatitudeRule: Number(e.target.value) })}
            className="w-full bg-transparent border-0 border-b border-hairline focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-ink-black"
          >
            {HIGH_LATITUDE_RULES.map((rule) => (
              <option key={rule.id} value={rule.id}>{rule.name}</option>
            ))}
          </select>
        </div>

      </div>

    </div>

  )

}


