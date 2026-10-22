import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { useLegalPath } from '@/lib/hooks/useIsAppLayout'
import { cn } from '@/lib/utils/format'

const SECTIONS = [
  { id: 'local', icon: 'devices', list: true },
  { id: 'cookies', icon: 'cookie' },
  { id: 'thirdParty', icon: 'public' },
  { id: 'notifications', icon: 'notifications' },
  { id: 'contact', icon: 'mail' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function QuestionBubble({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-end justify-end gap-2.5">
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-ee-md px-4 py-3',
          'bg-secondary text-on-secondary dark:bg-dark-green dark:text-dark-bg',
          'shadow-sm',
        )}
      >
        <p className="font-body-md text-body-md leading-relaxed">{children}</p>
      </div>
      <span
        className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-on-secondary dark:bg-dark-green dark:text-dark-bg"
        aria-hidden
        title={t('pages.privacy.youLabel')}
      >
        <span className="material-symbols-outlined text-[18px]">person</span>
      </span>
    </div>
  )
}

function AnswerBubble({
  icon,
  children,
}: {
  icon: string
  children: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div className="flex items-end justify-start gap-2.5">
      <span
        className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-soft text-secondary dark:bg-dark-green/20 dark:text-dark-green"
        aria-hidden
        title={t('pages.privacy.appLabel')}
      >
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </span>
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-es-md px-4 py-3',
          'bg-paper-white border border-hairline text-ink-soft',
          'dark:bg-dark-bg/70 dark:border-dark-border dark:text-dark-text-secondary',
        )}
      >
        <div className="font-body-md text-body-md leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  )
}

export function PrivacyPolicyPage() {
  const { t } = useTranslation()
  const sourcesPath = useLegalPath('/sources')
  const termsPath = useLegalPath('/terms')

  const answerFor = (id: SectionId): ReactNode => {
    if (id === 'local' || id === 'cookies') {
      return (
        <ul className="list-disc ps-5 space-y-1.5">
          {(
            t(`pages.privacy.sections.${id}.items`, {
              returnObjects: true,
            }) as string[]
          ).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    }

    if (id === 'thirdParty') {
      return (
        <p>
          {t('pages.privacy.sections.thirdParty.bodyBefore')}{' '}
          <Link to={sourcesPath} className="text-secondary dark:text-dark-green hover:underline">
            {t('footer.sources')}
          </Link>
          . {t('pages.privacy.sections.thirdParty.bodyAfter')}
        </p>
      )
    }

    return <p>{t(`pages.privacy.sections.${id}.body`)}</p>
  }

  return (
    <PageShell title={t('pages.privacy.title')} subtitle={t('pages.privacy.subtitle')}>
      <HoverCard className="mb-8 p-5 md:p-6 dark:bg-dark-surface dark:border-dark-border space-y-3">
        <div className="flex items-start gap-3">
          <span
            className="material-symbols-outlined text-secondary dark:text-dark-green text-2xl shrink-0"
            aria-hidden
          >
            policy
          </span>
          <div className="space-y-2 min-w-0">
            <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
              {t('pages.privacy.intro')}
            </p>
            <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
              {t('pages.privacy.lastUpdated')}
            </p>
          </div>
        </div>
      </HoverCard>

      <HoverCard className="overflow-hidden dark:bg-dark-surface dark:border-dark-border">
        <div className="flex items-center gap-2 px-4 md:px-5 py-3 border-b border-hairline dark:border-dark-border bg-cream/70 dark:bg-dark-bg/40">
          <span className="h-2.5 w-2.5 rounded-full bg-error/70" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-caution/70" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-secondary/70" aria-hidden />
          <p className="ms-2 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
            {t('pages.privacy.chatTitle')}
          </p>
        </div>

        <div
          className="relative p-4 md:p-6 bg-surface-container-low/50 dark:bg-dark-bg/30"
          aria-label={t('pages.privacy.chatTitle')}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-hairline) 70%, transparent) 1px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
            aria-hidden
          />

          <StaggerList className="relative space-y-5">
            {SECTIONS.map((section) => (
              <StaggerListItem key={section.id} className="space-y-3">
                <QuestionBubble>
                  {t(`pages.privacy.sections.${section.id}.question`)}
                </QuestionBubble>
                <AnswerBubble icon={section.icon}>{answerFor(section.id)}</AnswerBubble>
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      </HoverCard>

      <div className="mt-8 flex flex-wrap gap-4 font-label-sm text-label-sm">
        <Link
          to={termsPath}
          className="text-secondary dark:text-dark-green hover:underline min-h-11 inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          {t('footer.terms')}
        </Link>
        <Link
          to={sourcesPath}
          className="text-secondary dark:text-dark-green hover:underline min-h-11 inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">library_books</span>
          {t('footer.sources')}
        </Link>
      </div>
    </PageShell>
  )
}
