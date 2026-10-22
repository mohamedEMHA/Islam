import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/format'
import { sanitizeTafsirHtml } from '@/lib/utils/sanitizeHtml'

const COLLAPSED_MAX_HEIGHT_PX = 288

function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text)
}

interface TafsirTextProps {
  text: string
  className?: string
  /** Collapsed preview height in px. Default 288 (~12 lines). */
  collapsedMaxHeight?: number
}

export function TafsirText({
  text,
  className,
  collapsedMaxHeight = COLLAPSED_MAX_HEIGHT_PX,
}: TafsirTextProps) {
  const { t } = useTranslation()
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [needsCollapse, setNeedsCollapse] = useState(false)
  const isHtml = isHtmlContent(text)
  const safeHtml = useMemo(
    () => (isHtml ? sanitizeTafsirHtml(text) : text),
    [isHtml, text],
  )

  useEffect(() => {
    setExpanded(false)
  }, [text])

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el) return
    setNeedsCollapse(el.scrollHeight > collapsedMaxHeight + 16)
  }, [text, collapsedMaxHeight])

  const proseClassName = cn(
    'font-body-lg text-body-lg text-ink-soft leading-relaxed',
    '[&_h1]:font-heading-h3 [&_h1]:text-heading-h3 [&_h1]:text-ink-black [&_h1]:mt-0 [&_h1]:mb-3',
    '[&_h2]:font-heading-h3 [&_h2]:text-heading-h3 [&_h2]:text-ink-black [&_h2]:mt-6 [&_h2]:mb-3 [&_h2:first-child]:mt-0',
    '[&_h3]:font-medium [&_h3]:text-ink-black [&_h3]:mt-5 [&_h3]:mb-2',
    '[&_h4]:font-medium [&_h4]:text-ink-black [&_h4]:mt-4 [&_h4]:mb-2',
    '[&_p]:mb-3 [&_p:last-child]:mb-0',
    '[&_p[dir=rtl]]:font-arabic-quran [&_p[dir=rtl]]:text-arabic-quran [&_p[dir=rtl]]:text-primary [&_p[dir=rtl]]:leading-loose [&_p[dir=rtl]]:my-4',
    '[&_strong]:font-medium [&_strong]:text-ink-black',
    '[&_blockquote]:border-s-2 [&_blockquote]:border-secondary/40 [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:my-4',
    '[&_ul]:list-disc [&_ul]:ps-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ps-5 [&_ol]:mb-3',
    '[&_li]:mb-1',
    className,
  )

  const collapsed = needsCollapse && !expanded

  return (
    <div>
      <div
        className={cn(collapsed && 'relative overflow-hidden')}
        style={collapsed ? { maxHeight: collapsedMaxHeight } : undefined}
      >
        {isHtml ? (
          <div
            ref={contentRef}
            className={proseClassName}
            dir="auto"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <div ref={contentRef} className={cn(proseClassName, 'whitespace-pre-wrap')} dir="auto">
            {text}
          </div>
        )}

        {collapsed && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper-white to-transparent"
            aria-hidden
          />
        )}
      </div>

      {needsCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 font-label-sm text-label-sm text-secondary hover:text-primary transition-colors"
        >
          {expanded ? t('pages.tafsir.showLess') : t('pages.tafsir.showMore')}
        </button>
      )}
    </div>
  )
}
