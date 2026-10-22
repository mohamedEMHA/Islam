import { useTranslation } from 'react-i18next'
import { PageContentSkeleton } from '@/components/ui/Skeleton'

export function RouteFallback() {
  const { t } = useTranslation()

  return (
    <div aria-label={t('common.loadingPage')} className="route-fallback">
      <PageContentSkeleton />
    </div>
  )
}
