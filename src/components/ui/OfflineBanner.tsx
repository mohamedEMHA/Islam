import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { easeOutSoft } from '@/lib/motion'

export function OfflineBanner() {
  const online = useOnlineStatus()
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {!online ? (
        <motion.div
          key="offline-banner"
          className="fixed top-0 inset-x-0 z-[55] bg-primary-container text-on-primary-container text-center py-2 px-4 font-label-sm text-label-sm lg:ms-80"
          initial={reduceMotion ? false : { y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? undefined : { y: -48, opacity: 0 }}
          transition={easeOutSoft}
        >
          {t('offline.message')}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
