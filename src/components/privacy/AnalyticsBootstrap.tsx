import { useEffect } from 'react'
import { useConsentStore } from '@/lib/stores/consentStore'
import { isAnalyticsConfigured, loadAnalytics, unloadAnalytics } from '@/lib/analytics'

export function AnalyticsBootstrap() {
  const analytics = useConsentStore((s) => s.analytics)

  useEffect(() => {
    if (!isAnalyticsConfigured()) return
    if (analytics === 'accepted') {
      loadAnalytics()
      return
    }
    unloadAnalytics()
  }, [analytics])

  return null
}
