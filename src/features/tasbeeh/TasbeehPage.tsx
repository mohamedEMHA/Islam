import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { m as motion, useReducedMotion } from 'framer-motion'
import { countPulse } from '@/lib/motion'
import { useTasbeehStore, DHIKR_OPTIONS } from '@/lib/stores/tasbeehStore'
import { cn } from '@/lib/utils/format'

export function TasbeehPage() {
  const { t } = useTranslation()
  const { counts, activeDhikr, targets, increment, reset, setActiveDhikr } = useTasbeehStore()
  const [hapticsOn, setHapticsOn] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [ripple, setRipple] = useState(false)
  const reduceMotion = useReducedMotion()

  const count = counts[activeDhikr] ?? 0
  const target = targets[activeDhikr] ?? 33
  const dhikr = DHIKR_OPTIONS.find((d) => d.id === activeDhikr)
  const progress = Math.min((count / target) * 100, 100)

  const handleTap = () => {
    setRipple(true)
    setTimeout(() => setRipple(false), 600)
    if (hapticsOn && navigator.vibrate) navigator.vibrate(15)
    increment()
    if (hapticsOn && count + 1 === target && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }

  const handleReset = () => {
    if (count > 0) {
      reset()
      if (hapticsOn && navigator.vibrate) navigator.vibrate([50, 50, 50])
    }
  }

  const handlePhraseChange = (id: string) => {
    setActiveDhikr(id)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center relative px-margin-mobile md:px-8 xl:px-margin-desktop bg-surface overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center z-10 gap-12 py-12">
        <div className="w-full flex justify-center">
          <div className="relative w-64">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t('pages.tasbeeh.ariaSelectDhikr')}
              aria-expanded={menuOpen}
              className="inline-flex justify-between items-center w-full rounded-full border border-hairline bg-paper-white px-6 py-3 font-label-sm text-label-sm text-ink-soft hover:bg-cream-deep transition-colors"
            >
              <span>{dhikr ? t(`pages.tasbeeh.phrases.${dhikr.id}`) : t('pages.tasbeeh.phrases.subhanAllah')}</span>
              <span className="material-symbols-outlined text-[18px] ms-2 text-stone">expand_more</span>
            </button>
            {menuOpen && (
              <div className="absolute start-0 mt-2 w-full rounded-lg shadow-sm bg-paper-white border border-hairline z-20 py-1">
                {DHIKR_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handlePhraseChange(d.id)}
                    className="w-full text-start px-4 py-2 font-body-md text-body-md text-ink-soft hover:bg-green-soft hover:text-secondary transition-colors"
                  >
                    {t(`pages.tasbeeh.phrases.${d.id}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {dhikr && (
          <p dir="rtl" className="font-arabic-quran text-arabic-quran text-primary text-center">
            {dhikr.arabic}
          </p>
        )}

        <div className="relative flex items-center justify-center">
          <div className="absolute w-[min(340px,85vw)] md:w-[min(420px,85vw)] aspect-square rounded-full border border-hairline opacity-50 pointer-events-none" />
          <div className="absolute w-[min(280px,70vw)] md:w-[min(340px,85vw)] aspect-square rounded-full border border-outline-variant opacity-30 pointer-events-none" />

          <motion.button
            type="button"
            onClick={handleTap}
            className="relative w-[min(220px,60vw)] md:w-[min(260px,60vw)] aspect-square rounded-full bg-paper-white border border-hairline flex items-center justify-center shadow-sm z-10 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-4 focus:ring-offset-surface group overflow-hidden"
            whileTap={{ scale: 0.98 }}
            aria-label={t('pages.tasbeeh.ariaTapCount')}
          >
            <div className="absolute inset-0 rounded-full bg-green-soft opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div
              className={cn(
                'absolute inset-0 rounded-full bg-secondary/20 pointer-events-none',
                ripple && !reduceMotion ? 'tap-ripple' : ripple ? 'opacity-30' : 'opacity-0',
              )}
            />
            <div className="relative flex flex-col items-center text-center">
              <span className="font-label-sm text-label-sm text-stone mb-2 tracking-widest uppercase">{t('pages.tasbeeh.count')}</span>
              <motion.span
                key={count}
                animate={reduceMotion ? undefined : countPulse}
                className="font-display-h1 text-primary tabular-nums tracking-tighter"
                style={{ fontSize: '80px', lineHeight: 1 }}
              >
                {count}
              </motion.span>
            </div>
          </motion.button>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <button
            type="button"
            onClick={() => setHapticsOn(!hapticsOn)}
            aria-label={t('pages.tasbeeh.ariaToggleHaptics')}
            className="flex flex-col items-center gap-2 text-stone hover:text-primary transition-colors"
          >
            <div className="w-12 h-12 rounded-full border border-hairline bg-paper-white flex items-center justify-center">
              <span className={cn('material-symbols-outlined', !hapticsOn && 'opacity-50')}>vibration</span>
            </div>
            <span className="font-label-sm text-label-sm">{hapticsOn ? t('pages.tasbeeh.hapticsOn') : t('pages.tasbeeh.hapticsOff')}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label={t('pages.tasbeeh.ariaResetCount')}
            className="flex flex-col items-center gap-2 text-stone hover:text-error transition-colors"
          >
            <div className="w-12 h-12 rounded-full border border-hairline bg-paper-white flex items-center justify-center hover:border-error-container hover:bg-error-container transition-colors">
              <span className="material-symbols-outlined">refresh</span>
            </div>
            <span className="font-label-sm text-label-sm">{t('pages.tasbeeh.reset')}</span>
          </button>
        </div>

        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between font-label-sm text-label-sm text-stone mb-2">
            <span>{t('pages.tasbeeh.target')}: {target}</span>
            <span>{count}/{target}</span>
          </div>
          <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
