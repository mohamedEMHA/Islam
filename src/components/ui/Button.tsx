import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { LinkProps } from 'react-router-dom'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { buttonClassName } from '@/components/ui/buttonStyles'

interface ButtonBaseProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'text'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </button>
  )
}

type ButtonLinkProps = ButtonBaseProps &
  Omit<LinkProps, 'className' | 'children' | 'to'> & {
    to: string
  }

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  to,
  ...props
}: ButtonLinkProps) {
  return (
    <LocalizedLink to={to} className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </LocalizedLink>
  )
}
