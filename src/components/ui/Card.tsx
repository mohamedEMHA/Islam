import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/format'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md', ...props }: CardProps) {
  const paddingClass = { sm: 'p-4', md: 'p-6', lg: 'p-8' }[padding]
  return (
    <div
      className={cn(
        'bg-paper border border-hairline rounded-lg',
        paddingClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
