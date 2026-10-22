import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion'
import { useTranslatedNav } from '@/lib/hooks/useTranslatedNav'
import { ButtonLink } from '@/components/ui/Button'
import { LegalFooterLinks } from '@/components/nav/LegalFooterLinks'
import { SiteHeaderBar } from '@/components/nav/SiteHeaderBar'
import { cn } from '@/lib/utils/format'
import { scrollWindowToTop } from '@/lib/utils/scroll'
import { menuSlide, easeOutSoft, EASE_OUT_SOFT } from '@/lib/motion'

interface MegaMenuProps {
  activeGroupId: string | null
  onClose: () => void
}

export function MegaMenu({ activeGroupId, onClose }: MegaMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { groups } = useTranslatedNav()
  const reduceMotion = useReducedMotion()
  const group = groups.find((g) => g.id === activeGroupId)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (ref.current?.contains(target)) return
      if (target instanceof Element && target.closest('[data-mega-menu-trigger]')) return
      onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (activeGroupId) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleKey)
    }
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [activeGroupId, onClose])

  return (
    <AnimatePresence>
      {group && (
        <motion.div
          ref={ref}
          className="absolute top-full inset-x-0 bg-paper-white dark:bg-dark-surface border-b border-hairline dark:border-dark-border z-40 shadow-sm"
          variants={reduceMotion ? undefined : menuSlide}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? false : 'visible'}
          exit={reduceMotion ? undefined : 'exit'}
        >
          <div className="max-w-screen-2xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone dark:text-dark-text-secondary mb-6">
              {group.label}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => (
                <li key={item.path + item.label}>
                  <LocalizedLink
                    to={item.path}
                    onClick={onClose}
                    className="group flex items-start gap-3 p-4 rounded-lg hover:bg-cream-deep dark:hover:bg-dark-bg transition-colors"
                  >
                    <span className="material-symbols-outlined text-stone group-hover:text-secondary mt-0.5">
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-medium text-ink-black dark:text-dark-text group-hover:text-secondary">
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-sm text-stone dark:text-dark-text-secondary mt-1">{item.description}</p>
                      )}
                    </div>
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function MegaMenuTrigger({
  id,
  label,
  isOpen,
  onToggle,
}: {
  id: string
  label: string
  isOpen: boolean
  onToggle: (id: string) => void
}) {
  return (
    <button
      type="button"
      data-mega-menu-trigger
      // Prevent MegaMenu's document mousedown-outside from closing before this click toggles.
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => onToggle(id)}
      className={`flex items-center gap-1 font-label-sm text-label-sm uppercase tracking-widest transition-colors pb-1 ${
        isOpen
          ? 'text-secondary border-b-2 border-secondary'
          : 'text-ink-soft hover:text-secondary opacity-80 hover:opacity-100 dark:text-dark-text-secondary'
      }`}
      aria-expanded={isOpen}
    >
      {label}
      <motion.span
        className="material-symbols-outlined text-sm normal-case tracking-normal"
        aria-hidden
        initial={false}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.22, ease: EASE_OUT_SOFT }}
      >
        expand_more
      </motion.span>
    </button>
  )
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function MobileMegaMenu({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const { t } = useTranslation()
  const { groups } = useTranslatedNav()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const scrollYRef = useRef(0)

  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    scrollYRef.current = window.scrollY
    const lockedPath = window.location.pathname
    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPosition = body.style.position
    const previousTop = body.style.top
    const previousWidth = body.style.width

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollYRef.current}px`
    body.style.width = '100%'

    closeButtonRef.current?.focus()
    document.addEventListener('keydown', trapFocus)

    return () => {
      body.style.overflow = previousOverflow
      body.style.position = previousPosition
      body.style.top = previousTop
      body.style.width = previousWidth
      // Navigating from the menu must not restore the previous page scroll.
      const samePage = window.location.pathname === lockedPath
      if (samePage) {
        window.scrollTo(0, scrollYRef.current)
      } else {
        scrollWindowToTop()
      }
      document.removeEventListener('keydown', trapFocus)
      previousFocusRef.current?.focus?.()
    }
  }, [open, trapFocus])

  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(min-width: 1024px)')
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) onClose()
    }
    handleChange(mq)
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [open, onClose])

  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) setExpanded(null)
  }, [open])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('common.navigationMenu')}
          className="fixed inset-0 z-[80] bg-surface dark:bg-dark-bg overflow-y-auto lg:hidden"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={easeOutSoft}
        >
          <SiteHeaderBar
            sticky={false}
            onMenuClick={onClose}
            onNavigate={onClose}
            menuButtonRef={closeButtonRef}
            menuOpen
          />
          {groups.map((group) => {
            const isExpanded = expanded === group.id
            return (
              <div key={group.id} className="border-b border-hairline dark:border-dark-border">
                <button
                  type="button"
                  className="w-full flex justify-between items-center min-h-11 p-4 text-start font-medium dark:text-dark-text"
                  onClick={() => setExpanded(isExpanded ? null : group.id)}
                  aria-expanded={isExpanded}
                >
                  {group.label}
                  <motion.span
                    className="material-symbols-outlined shrink-0"
                    aria-hidden
                    initial={false}
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={
                      reduceMotion ? { duration: 0 } : { duration: 0.28, ease: EASE_OUT_SOFT }
                    }
                  >
                    expand_more
                  </motion.span>
                </button>
                <div
                  className={cn(
                    'grid',
                    !reduceMotion &&
                      'transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <ul className="pb-4 px-6 space-y-3">
                      {group.items.map((item) => (
                        <li key={item.path + item.label}>
                          <LocalizedLink
                            to={item.path}
                            onClick={onClose}
                            tabIndex={isExpanded ? undefined : -1}
                            className="flex items-center gap-3 min-h-11 text-ink-soft hover:text-secondary dark:text-dark-text-secondary transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-soft)]"
                          >
                            <span className="material-symbols-outlined text-sm">{item.icon}</span>
                            {item.label}
                          </LocalizedLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="p-4 space-y-4 pb-safe">
            <ButtonLink to="/prayer_times" onClick={onClose} className="w-full justify-center">
              {t('common.openApp')}
            </ButtonLink>
            <LegalFooterLinks onNavigate={onClose} />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
