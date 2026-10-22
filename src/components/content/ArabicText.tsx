interface ArabicTextProps {
  children: string
  variant?: 'quran' | 'ui'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ArabicText({
  children,
  variant = 'quran',
  size = 'md',
  className = '',
}: ArabicTextProps) {
  const fontClass = variant === 'quran' ? 'font-arabic-quran' : 'font-arabic-ui'
  const sizeClass = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size]
  return (
    <p
      dir="rtl"
      lang="ar"
      className={`${fontClass} ${sizeClass} leading-loose text-ink break-words ${className}`}
    >
      {children}
    </p>
  )
}
