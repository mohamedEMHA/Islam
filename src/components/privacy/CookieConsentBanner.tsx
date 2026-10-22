import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { useConsentStore } from '@/lib/stores/consentStore'
import { isAnalyticsConfigured } from '@/lib/analytics'
import { useLegalPath } from '@/lib/hooks/useIsAppLayout'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { easeOutSoft } from '@/lib/motion'

export function CookieConsentBanner() {
  const { t } = useTranslation()
  const privacyPath = useLegalPath('/privacy')
  const analytics = useConsentStore((s) => s.analytics)
  const setAnalyticsConsent = useConsentStore((s) => s.setAnalyticsConsent)
  const analyticsAvailable = isAnalyticsConfigured()
  const reduceMotion = useReducedMotion()
  const open = analytics === 'unset'

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="cookie-consent"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          className="fixed inset-x-0 bottom-0 z-[70] p-4 pb-[calc(1rem+var(--safe-bottom))] md:p-6 pointer-events-none"
          initial={reduceMotion ? false : { y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? undefined : { y: 24, opacity: 0 }}
          transition={easeOutSoft}
        >
          <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-hairline dark:border-dark-border bg-paper-white dark:bg-dark-surface shadow-lg p-5 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <span
                className="material-symbols-outlined text-secondary dark:text-dark-green text-2xl shrink-0 mt-0.5"
                aria-hidden
              >
                cookie
              </span>
              <div className="min-w-0 space-y-2">
                <h2
                  id="cookie-consent-title"
                  className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text text-lg"
                >
                  {t('cookieConsent.title')}
                </h2>
                <p
                  id="cookie-consent-desc"
                  className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed"
                >
                  {analyticsAvailable ? t('cookieConsent.body') : t('cookieConsent.bodyEssential')}{' '}
                  <LocalizedLink
                    to={privacyPath}
                    className="text-secondary dark:text-dark-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-sm"
                  >
                    {t('footer.privacy')}
                  </LocalizedLink>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
              {analyticsAvailable ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setAnalyticsConsent('rejected')}
                  >
                    {t('cookieConsent.reject')}
                  </Button>
                  <Button type="button" size="sm" onClick={() => setAnalyticsConsent('accepted')}>
                    {t('cookieConsent.accept')}
                  </Button>
                </>
              ) : (
                <Button type="button" size="sm" onClick={() => setAnalyticsConsent('rejected')}>
                  {t('cookieConsent.gotIt')}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
