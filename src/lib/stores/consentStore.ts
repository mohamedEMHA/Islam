import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AnalyticsConsent = 'unset' | 'accepted' | 'rejected'

interface ConsentState {
  analytics: AnalyticsConsent
  decidedAt: string | null
  setAnalyticsConsent: (value: 'accepted' | 'rejected') => void
  resetConsent: () => void
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      analytics: 'unset',
      decidedAt: null,
      setAnalyticsConsent: (value) =>
        set({
          analytics: value,
          decidedAt: new Date().toISOString(),
        }),
      resetConsent: () =>
        set({
          analytics: 'unset',
          decidedAt: null,
        }),
    }),
    {
      name: 'islam-consent',
      version: 1,
      partialize: (state) => ({
        analytics: state.analytics,
        decidedAt: state.decidedAt,
      }),
    },
  ),
)
