import { useId } from 'react'
import { cn } from '@/lib/utils/format'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft dark:text-dark-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full bg-transparent border-b border-hairline dark:border-dark-border py-2 text-ink dark:text-dark-text',
          'focus:border-green-deep dark:focus:border-dark-green focus:outline-none',
          'transition-[border-color,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]',
          'focus:shadow-[0_1px_0_0_var(--color-green-deep)] dark:focus:shadow-[0_1px_0_0_var(--color-dark-green)]',
          'placeholder:text-stone dark:placeholder:text-dark-text-secondary',
          className,
        )}
        {...props}
      />
    </div>
  )
}
