import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/format'

const ICON_LOGO_SRC = '/logo.png'
const MAIN_LOGO_SRC = '/brand/main-logo.png'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showWordmark?: boolean
  className?: string
  linkClassName?: string
  linkTo?: string | false
}

/** Icon-only sizes (hero, standalone mark). */
const iconSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-32 w-32',
}

/** Wordmark lockup: main-logo.png at natural aspect ratio. */
const wordmarkSizes = {
  sm: 'h-7 w-auto max-w-[160px]',
  md: 'h-8 md:h-9 w-auto max-w-[180px]',
  lg: 'h-10 md:h-12 w-auto max-w-[220px]',
  xl: 'h-12 md:h-14 w-auto max-w-[260px]',
}

export function BrandLogo({
  size = 'md',
  showWordmark = false,
  className,
  linkClassName,
  linkTo = '/',
}: BrandLogoProps) {
  const { t } = useTranslation()
  const appName = t('app.name')

  const wrapperClassName = cn(
    'inline-flex items-center',
    !showWordmark && 'gap-3',
    linkClassName,
  )

  const content = showWordmark ? (
    <img
      src={MAIN_LOGO_SRC}
      alt={appName}
      width={260}
      height={56}
      decoding="async"
      className={cn(
        wordmarkSizes[size],
        'shrink-0 object-contain object-start',
        className,
      )}
    />
  ) : (
    <img
      src={ICON_LOGO_SRC}
      alt={appName}
      width={64}
      height={64}
      decoding="async"
      className={cn(iconSizes[size], 'shrink-0 object-contain', className)}
    />
  )

  if (linkTo !== false) {
    return (
      <LocalizedLink to={linkTo || '/'} className={wrapperClassName} aria-label={appName}>
        {content}
      </LocalizedLink>
    )
  }

  return <div className={wrapperClassName}>{content}</div>
}
