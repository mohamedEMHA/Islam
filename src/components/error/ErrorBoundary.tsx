import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  /** When this value changes, error state is cleared (e.g. route pathname). */
  resetKey?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

function ErrorBoundaryFallback({
  error,
  onRetry,
}: {
  error: Error | null
  onRetry: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop bg-surface-container-low text-ink-black">
      <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
      <h1 className="font-heading-h2 text-heading-h2 text-primary mb-2">{t('errors.boundaryTitle')}</h1>
      <p className="font-body-md text-body-md text-ink-soft mb-6 text-center max-w-md">
        {error?.message ?? t('errors.unexpected')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-2.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-widest"
      >
        {t('common.retry')}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey &&
      this.props.resetKey !== undefined
    ) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}
