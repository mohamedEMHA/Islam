import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { m as motion, useReducedMotion } from 'framer-motion'
import { useDetectLocation } from '@/lib/hooks/useDetectLocation'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { fadeUp, heroStagger } from '@/lib/motion'

export function WelcomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { location, detectAndSave, loading, error } = useDetectLocation()
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const reduceMotion = useReducedMotion()

  const finishWithDetected = async () => {
    const result = await detectAndSave()
    if (result) {
      navigate('/prayer_times')
    }
  }

  const finishWithDefault = () => {
    updateSettings({ onboardingComplete: true })
    navigate('/prayer_times')
  }

  const continueWithSaved = () => {
    updateSettings({ onboardingComplete: true })
    navigate('/prayer_times')
  }

  const locationLabel = location?.city
    ? location.country
      ? `${location.city}, ${location.country}`
      : location.city
    : location
      ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`
      : null

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-6 text-center gap-8 bg-surface-container-low dark:bg-dark-bg">
      <motion.div
        className="flex flex-col items-center gap-8 max-w-md"
        variants={reduceMotion ? undefined : heroStagger}
        initial={reduceMotion ? false : 'hidden'}
        animate={reduceMotion ? false : 'visible'}
      >
        <motion.div variants={reduceMotion ? undefined : fadeUp}>
          <BrandLogo size="xl" linkTo={false} />
        </motion.div>
        <motion.div variants={reduceMotion ? undefined : fadeUp} className="space-y-4">
          <h1 className="font-display-h1 text-display-h1-mobile md:text-display-h1 text-ink-black dark:text-dark-text">
            {t('pages.welcome.title')}
          </h1>
          <p className="font-body-lg text-body-lg text-ink-soft dark:text-dark-text-secondary leading-relaxed">
            {t('pages.welcome.subtitle')}
          </p>
        </motion.div>
        <motion.div variants={reduceMotion ? undefined : fadeUp} className="flex flex-col gap-3 w-full">
          {locationLabel ? (
            <>
              <p className="text-sm text-stone dark:text-dark-text-secondary">
                {t('pages.welcome.locationDetected', { location: locationLabel })}
              </p>
              <Button onClick={continueWithSaved} size="lg">
                {t('pages.welcome.continue')}
              </Button>
              <Button variant="ghost" onClick={() => void finishWithDetected()} disabled={loading} size="lg">
                {loading ? t('pages.welcome.gettingLocation') : t('pages.welcome.useDifferent')}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => void finishWithDetected()} disabled={loading} size="lg">
                {loading ? t('pages.welcome.gettingLocation') : t('pages.welcome.enableLocation')}
              </Button>
              {error && <p className="text-sm text-error">{error}</p>}
              <Button variant="secondary" onClick={finishWithDefault} size="lg">
                {t('pages.welcome.continueDefault')}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </main>
  )
}
