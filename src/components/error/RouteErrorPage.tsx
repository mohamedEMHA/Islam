import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LocalizedLink } from '@/components/routing/LocalizedLink'

export function RouteErrorPage() {
  const error = useRouteError()
  const { t } = useTranslation()

  let title = t('errors.generic')
  let message = t('errors.generic')

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    message = error.data?.toString() ?? error.statusText
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop bg-surface-container-low text-ink-black">
      <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
      <h1 className="font-heading-h2 text-heading-h2 text-primary mb-2">{title}</h1>
      <p className="font-body-md text-body-md text-ink-soft mb-6 text-center max-w-md">{message}</p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-widest active:scale-[0.98] transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]"
        >
          {t('common.retry')}
        </button>
        <LocalizedLink
          to="/"
          className="px-6 py-2.5 rounded border border-hairline text-ink-soft font-label-sm text-label-sm uppercase tracking-widest hover:bg-cream-deep transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-soft)] active:scale-[0.98]"
        >
          {t('common.back')}
        </LocalizedLink>
      </div>
    </div>
  )
}
