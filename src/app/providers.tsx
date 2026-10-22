import { useEffect, useLayoutEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig, LazyMotion, domAnimation } from 'framer-motion'
import { router } from './router'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { queryClient } from '@/lib/query/client'
import i18n, { ensureLocaleLoaded } from '@/i18n'
import { getLanguageDirection } from '@/i18n/config'
import { getPersistedTheme } from '@/lib/utils/persistedSettings'
import { applyDocumentTheme } from '@/lib/utils/applyTheme'
import { AnalyticsBootstrap } from '@/components/privacy/AnalyticsBootstrap'

function ThemeSync() {
  const theme = useSettingsStore((s) => s.theme)
  const language = useSettingsStore((s) => s.language)

  useLayoutEffect(() => {
    applyDocumentTheme(theme)
  }, [theme])

  useEffect(() => {
    applyDocumentTheme(getPersistedTheme())

    return useSettingsStore.persist.onFinishHydration(() => {
      applyDocumentTheme(useSettingsStore.getState().theme)
    })
  }, [])

  useEffect(() => {
    void ensureLocaleLoaded(language).then(() => {
      void i18n.changeLanguage(language)
    })
    const root = document.documentElement
    root.lang = language
    root.dir = getLanguageDirection(language)
  }, [language])

  return null
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeSync />
        <AnalyticsBootstrap />
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="user">
            <RouterProvider router={router} />
          </MotionConfig>
        </LazyMotion>
      </I18nextProvider>
    </QueryClientProvider>
  )
}
