import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, m as motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/format'
import { menuSlide, sheetUp } from '@/lib/motion'
import {
  getChapterDisplayTitle,
  hasMeaningfulChapterTitle,
} from '@/lib/utils/sunnahParsers'
import type { HadithChapter } from '@/types/hadith'

function normalizeChapterKey(value: string | null | undefined): string {
  if (!value) return ''
  return value.trim().replace(/\.0+$/, '')
}

function chapterMatchesParam(chapter: HadithChapter, param: string | null): boolean {
  if (!param) return false
  const key = normalizeChapterKey(param)
  if (!key) return false
  return (
    chapter.chapterId === param ||
    chapter.chapterNumber === param ||
    normalizeChapterKey(chapter.chapterId) === key ||
    normalizeChapterKey(chapter.chapterNumber) === key
  )
}

interface HadithChapterPickerProps {
  chapters: HadithChapter[]
  selectedChapterId: string | null
  onSelect: (chapterId: string | null) => void
  className?: string
}

function chapterLabel(chapter: HadithChapter, untitledFallback: string): string {
  if (hasMeaningfulChapterTitle(chapter)) {
    return `${chapter.chapterNumber}. ${getChapterDisplayTitle(chapter)}`
  }
  // Avoid "2. Chapter 2" — untitledFallback is already "Chapter N"
  return untitledFallback
}

export function HadithChapterPicker({
  chapters,
  selectedChapterId,
  onSelect,
  className,
}: HadithChapterPickerProps) {
  const { t } = useTranslation()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [isMobileSheet, setIsMobileSheet] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setIsMobileSheet(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const selected = chapters.find((chapter) => chapterMatchesParam(chapter, selectedChapterId))
  const triggerLabel = selected
    ? chapterLabel(selected, t('hadithReader.chapterNumber', { number: selected.chapterNumber }))
    : t('hadithReader.allChapters')

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open || !selectedChapterId || !listRef.current) return
    const active = listRef.current.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [open, selectedChapterId])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        id={`${listId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-hairline bg-paper-white px-3 py-2.5 text-start font-body-md text-body-md text-ink-black transition-colors hover:border-secondary/40 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-green/40"
      >
        <span className="truncate">{triggerLabel}</span>
        <span className="material-symbols-outlined shrink-0 text-[20px] text-stone dark:text-dark-text-secondary">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {isMobileSheet ? (
              <motion.button
                type="button"
                aria-label={t('common.close')}
                className="fixed inset-0 z-20 bg-ink-black/30"
                onClick={() => setOpen(false)}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
              />
            ) : null}
            <motion.div
              id={listId}
              ref={listRef}
              role="listbox"
              aria-labelledby={`${listId}-trigger`}
              variants={reduceMotion ? undefined : isMobileSheet ? sheetUp : menuSlide}
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? false : 'visible'}
              exit={reduceMotion ? undefined : 'exit'}
              className={cn(
                'z-30 w-full overflow-y-auto border border-hairline bg-paper-white p-1 shadow-lg thin-scrollbar dark:border-dark-border dark:bg-dark-surface',
                isMobileSheet
                  ? 'fixed inset-x-0 bottom-0 max-h-[min(70dvh,calc(100dvh-var(--safe-bottom)))] rounded-t-2xl rounded-b-none border-b-0 pb-safe'
                  : 'absolute mt-2 max-h-72 rounded-xl',
              )}
            >
          <button
            type="button"
            role="option"
            aria-selected={!selectedChapterId}
            data-active={!selectedChapterId ? 'true' : undefined}
            onClick={() => {
              onSelect(null)
              setOpen(false)
            }}
            className={cn(
              'flex w-full rounded-lg px-3 py-2 text-start font-body-md text-body-md transition-colors',
              !selectedChapterId
                ? 'bg-green-soft text-secondary dark:bg-dark-green/20 dark:text-dark-green'
                : 'text-ink-soft hover:bg-cream-deep dark:text-dark-text-secondary dark:hover:bg-dark-border/40',
            )}
          >
            {t('hadithReader.allChapters')}
          </button>

          {chapters.map((chapter) => {
            const isActive = chapterMatchesParam(chapter, selectedChapterId)
            return (
              <button
                key={chapter.chapterId}
                type="button"
                role="option"
                aria-selected={isActive}
                data-active={isActive ? 'true' : undefined}
                onClick={() => {
                  onSelect(chapter.chapterId)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full rounded-lg px-3 py-2 text-start font-body-md text-body-md transition-colors',
                  isActive
                    ? 'bg-green-soft text-secondary dark:bg-dark-green/20 dark:text-dark-green'
                    : 'text-ink-soft hover:bg-cream-deep dark:text-dark-text-secondary dark:hover:bg-dark-border/40',
                )}
              >
                <span className="line-clamp-2">
                  {chapterLabel(
                    chapter,
                    t('hadithReader.chapterNumber', { number: chapter.chapterNumber }),
                  )}
                </span>
              </button>
            )
          })}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
