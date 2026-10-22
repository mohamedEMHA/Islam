import { cn } from '@/lib/utils/format'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'skeleton-shimmer bg-cream-deep dark:bg-dark-border rounded',
        className,
      )}
      aria-hidden="true"
    />
  )
}

function PageHeaderSkeleton({
  withLocation = false,
  withAction = false,
}: {
  withLocation?: boolean
  withAction?: boolean
}) {
  return (
    <div className="relative mb-8 md:mb-10">
      <div className="flex flex-col items-center text-center space-y-3">
        <Skeleton className="h-9 w-48 md:w-64 rounded-lg" />
        {withLocation && <Skeleton className="h-4 w-36 rounded" />}
        {withAction && <Skeleton className="lg:hidden h-10 w-28 rounded-full" />}
      </div>
      {withAction && (
        <Skeleton className="hidden lg:block absolute top-0 end-0 h-10 w-28 rounded-full" />
      )}
    </div>
  )
}

export function ListRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border border-hairline dark:border-dark-border bg-paper-white dark:bg-dark-surface px-4 py-4',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="space-y-2 min-w-0 flex-1">
          <Skeleton className="h-4 w-2/3 max-w-[12rem] rounded" />
          <Skeleton className="h-3 w-1/3 max-w-[7rem] rounded" />
        </div>
      </div>
      <Skeleton className="h-4 w-14 shrink-0 rounded" />
    </div>
  )
}

export function CardBlockSkeleton({
  className,
  lines = 3,
}: {
  className?: string
  lines?: number
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-hairline dark:border-dark-border bg-paper-white dark:bg-dark-surface p-6 space-y-4',
        className,
      )}
    >
      <Skeleton className="h-5 w-32 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4 rounded', i === lines - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function PrayerTimesCardSkeleton({
  className,
  'aria-label': ariaLabel,
}: {
  className?: string
  'aria-label'?: string
}) {
  return (
    <div
      className={cn(
        'bg-paper-white dark:bg-dark-surface border border-hairline dark:border-dark-border rounded-xl p-8 w-full max-w-md shadow-sm',
        className,
      )}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="space-y-2 flex flex-col items-end">
          <Skeleton className="h-12 w-24 rounded-lg" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
      </div>

      <Skeleton className="h-1 w-full rounded-full mb-8" />

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-2 border-b border-hairline dark:border-dark-border last:border-0"
          >
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center bg-surface dark:bg-dark-bg p-4 rounded-lg border border-hairline dark:border-dark-border">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <Skeleton className="h-4 w-14 rounded" />
      </div>
    </div>
  )
}

export function PrayerTimesPageSkeleton() {
  return (
    <div className="w-full px-margin-mobile md:px-8 xl:px-margin-desktop py-8 md:py-10" aria-busy="true">
      <PageHeaderSkeleton withLocation withAction />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-primary/90 dark:bg-dark-surface rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-primary-container dark:border-dark-border">
            <div className="space-y-3 w-full max-w-xs">
              <div className="skeleton-shimmer h-3 w-24 rounded bg-on-primary/20 dark:bg-dark-border" aria-hidden="true" />
              <div className="skeleton-shimmer h-12 w-40 rounded-lg bg-on-primary/25 dark:bg-dark-border" aria-hidden="true" />
              <div className="skeleton-shimmer h-6 w-28 rounded bg-on-primary/20 dark:bg-dark-border" aria-hidden="true" />
            </div>
            <div className="skeleton-shimmer h-48 w-48 rounded-full shrink-0 bg-on-primary/20 dark:bg-dark-border" aria-hidden="true" />
          </div>

          <div className="bg-paper-white dark:bg-dark-surface rounded-xl border border-hairline dark:border-dark-border p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-hairline dark:border-dark-border">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-28 rounded" />
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 rounded-lg"
                >
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          <CardBlockSkeleton lines={4} />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function PageContentSkeleton() {
  return (
    <div
      className="px-margin-mobile md:px-8 xl:px-margin-desktop py-8 md:py-10 w-full"
      aria-busy="true"
    >
      <PageHeaderSkeleton />

      <div className="space-y-6 max-w-screen-2xl">
        <CardBlockSkeleton className="h-auto" lines={2} />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DailyFeedSkeleton() {
  return (
    <div className="mb-8 max-w-2xl mx-auto rounded-xl border border-hairline dark:border-dark-border bg-paper-white/80 dark:bg-dark-bg/60 px-6 py-8 md:px-10 space-y-5">
      <Skeleton className="h-3 w-28 mx-auto rounded" />
      <Skeleton className="h-10 w-4/5 mx-auto rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-4 w-40 mx-auto rounded" />
    </div>
  )
}
