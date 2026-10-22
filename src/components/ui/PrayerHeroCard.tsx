import { m as motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { easeOutSoft } from '@/lib/motion'

const PATTERN_BG = "url('/brand/prayer_pattern.webp')"

interface PrayerHeroCardProps {
  prayerName: string
  prayerTime: string
  countdownLabel: string
  progress: number
}

export function PrayerHeroCard({ prayerName, prayerTime, countdownLabel, progress }: PrayerHeroCardProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <div className="bg-primary text-on-primary rounded-xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-primary-container">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: PATTERN_BG, backgroundSize: 'cover' }}
      />
      <div className="z-10 text-center md:text-start mb-8 md:mb-0">
        <p className="font-label-sm text-label-sm text-inverse-primary tracking-widest uppercase mb-2">
          {t('common.nextPrayer')}
        </p>
        <h3 className="font-display-h1-mobile md:font-display-h1 text-display-h1-mobile md:text-display-h1 font-bold mb-2">
          {prayerName}
        </h3>
        <p className="font-heading-h3 text-heading-h3 text-on-primary opacity-90">{prayerTime}</p>
      </div>
      <div className="z-10 relative flex items-center justify-center">
        <svg className="w-48 h-48" viewBox="0 0 120 120">
          <circle
            className="text-primary-container stroke-current"
            cx="60"
            cy="60"
            fill="transparent"
            r={radius}
            strokeWidth="4"
          />
          <motion.circle
            className="text-inverse-primary stroke-current progress-ring-circle"
            cx="60"
            cy="60"
            fill="transparent"
            r={radius}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={reduceMotion ? false : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={countdownLabel}
            initial={reduceMotion ? false : { scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={easeOutSoft}
            className="font-heading-h3 text-heading-h3 font-bold"
          >
            {countdownLabel}
          </motion.span>
          <span className="font-label-sm text-label-sm text-inverse-primary">{t('common.remaining')}</span>
        </div>
      </div>
    </div>
  )
}
