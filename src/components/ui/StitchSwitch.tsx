import { cn } from '@/lib/utils/format'

interface StitchSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  'aria-label'?: string
}

export function StitchSwitch({ checked, onChange, id, 'aria-label': ariaLabel }: StitchSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300',
        // Invisible expanded hit target (44px) without bloating the visible track.
        'after:absolute after:content-[""] after:inset-y-[-10px] after:inset-x-[-6px]',
        checked ? 'bg-primary-container dark:bg-dark-green' : 'bg-outline-variant/70 dark:bg-dark-border',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none h-5 w-5 rounded-full bg-paper-white shadow-sm transition-transform duration-300',
          checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}
