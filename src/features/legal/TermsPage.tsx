import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { TabPills } from '@/components/ui/TabPills'
import { TabFade } from '@/components/motion/TabFade'
import { HoverCard } from '@/components/motion/HoverCard'
import { useLegalPath } from '@/lib/hooks/useIsAppLayout'
import { cn } from '@/lib/utils/format'

type TermsSectionId = 'use' | 'accuracy' | 'availability' | 'contact'

const SECTIONS: Array<{ id: TermsSectionId; icon: string }> = [
  { id: 'use', icon: 'menu_book' },
  { id: 'accuracy', icon: 'info' },
  { id: 'availability', icon: 'cloud_off' },
  { id: 'contact', icon: 'mail' },
]

function TermsVisual({ id }: { id: TermsSectionId }) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-hairline bg-cream dark:border-dark-border dark:bg-dark-surface',
        'min-h-[260px] md:min-h-[320px]',
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-soft/50 via-transparent to-cream-deep/40 dark:from-dark-green/15 dark:to-transparent" />

      <div className="relative p-5 md:p-6 h-full flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-caution/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-secondary/70" />
          <span className="ms-auto font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
            {t(`pages.terms.sections.${id}.title`)}
          </span>
        </div>

        {id === 'use' && (
          <div className="space-y-3 mt-2 flex-1">
            <div className="rounded-xl bg-paper-white/90 dark:bg-dark-bg/60 border border-hairline dark:border-dark-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary dark:text-dark-green">menu_book</span>
                <span className="font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary">
                  {t('pages.terms.visual.contentTypes')}
                </span>
              </div>
              <div className="h-2 rounded-full bg-green-soft dark:bg-dark-green/20 w-4/5" />
              <div className="h-2 rounded-full bg-cream-deep dark:bg-dark-border w-3/5" />
              <div className="h-2 rounded-full bg-cream-deep dark:bg-dark-border w-2/3" />
            </div>
            <div className="rounded-lg bg-paper-white/80 dark:bg-dark-bg/40 border border-hairline dark:border-dark-border px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary dark:text-dark-green text-[20px]">verified</span>
              <span className="font-label-sm text-label-sm text-ink-soft dark:text-dark-text-secondary">
                {t('footer.sources')}
              </span>
            </div>
          </div>
        )}

        {id === 'accuracy' && (
          <div className="space-y-3 mt-2 flex-1">
            <div className="rounded-xl bg-paper-white/90 dark:bg-dark-bg/60 border border-hairline dark:border-dark-border p-5">
              <p className="font-label-sm text-label-sm text-secondary dark:text-dark-green uppercase tracking-widest mb-2">
                {t('pages.terms.visual.estimates')}
              </p>
              <div className="space-y-2">
                {(
                  [
                    'pages.terms.visual.prayerTimes',
                    'pages.terms.visual.zakat',
                    'pages.terms.visual.inheritance',
                  ] as const
                ).map((itemKey) => (
                  <div
                    key={itemKey}
                    className="flex items-center justify-between rounded-lg bg-cream/80 dark:bg-dark-border/40 px-3 py-2"
                  >
                    <span className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
                      {t(itemKey)}
                    </span>
                    <span className="material-symbols-outlined text-caution text-[18px]">info</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary text-center px-2">
              {t('pages.terms.visual.verifyScholars')}
            </p>
          </div>
        )}

        {id === 'availability' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-4">
            <div className="h-20 w-20 rounded-2xl bg-paper-white/90 dark:bg-dark-bg/60 border border-hairline dark:border-dark-border flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary dark:text-dark-green text-4xl">cloud_off</span>
            </div>
            <div className="rounded-xl bg-paper-white/90 dark:bg-dark-bg/60 border border-hairline dark:border-dark-border px-5 py-3 text-center max-w-xs">
              <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary">
                {t('pages.terms.visual.availabilityNote')}
              </p>
            </div>
          </div>
        )}

        {id === 'contact' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-4">
            <div className="h-20 w-20 rounded-2xl bg-green-soft dark:bg-dark-green/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary dark:text-dark-green text-4xl">mail</span>
            </div>
            <div className="rounded-xl bg-paper-white/90 dark:bg-dark-bg/60 border border-hairline dark:border-dark-border px-5 py-4 text-center space-y-2">
              <p className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text text-lg">
                {t('common.reportIssue')}
              </p>
              <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
                {t('pages.terms.visual.reportAvailable')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function TermsPage() {
  const { t } = useTranslation()
  const sourcesPath = useLegalPath('/sources')
  const privacyPath = useLegalPath('/privacy')
  const [active, setActive] = useState<TermsSectionId>('use')
  const section = SECTIONS.find((item) => item.id === active) ?? SECTIONS[0]

  return (
    <PageShell title={t('pages.terms.title')} subtitle={t('pages.terms.subtitle')}>
      <HoverCard className="mb-8 p-5 md:p-6 dark:bg-dark-surface dark:border-dark-border space-y-3">
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
          {t('pages.terms.intro')}
        </p>
        <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
          {t('pages.terms.lastUpdated')}
        </p>
      </HoverCard>

      <TabPills
        tabs={SECTIONS.map((item) => ({
          id: item.id,
          label: t(`pages.terms.sections.${item.id}.title`),
        }))}
        active={active}
        onChange={setActive}
        className="mb-8"
      />

      <TabFade activeKey={active}>
          <HoverCard className="overflow-hidden dark:bg-dark-surface dark:border-dark-border">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center gap-5 order-1">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-soft text-secondary dark:bg-dark-green/20 dark:text-dark-green">
                  <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                </div>

                <div className="space-y-3">
                  <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text">
                    {t(`pages.terms.sections.${active}.title`)}
                  </h2>
                  {active === 'use' ? (
                    <div className="space-y-3 font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
                      <p>{t('pages.terms.sections.use.body')}</p>
                      <p>
                        {t('pages.terms.sections.use.bodySourcesBefore')}{' '}
                        <Link
                          to={sourcesPath}
                          className="text-secondary dark:text-dark-green hover:underline"
                        >
                          {t('footer.sources')}
                        </Link>
                        {t('pages.terms.sections.use.bodySourcesAfter')}
                      </p>
                    </div>
                  ) : (
                    <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
                      {t(`pages.terms.sections.${active}.body`)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6 lg:p-8 bg-surface-container-low/60 dark:bg-dark-bg/40 order-2 border-b lg:border-b-0 lg:border-s border-hairline dark:border-dark-border">
                <TermsVisual id={active} />
              </div>
            </div>
          </HoverCard>
      </TabFade>

      <div className="mt-8 flex flex-wrap gap-4 font-label-sm text-label-sm">
        <Link
          to={privacyPath}
          className="text-secondary dark:text-dark-green hover:underline inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">policy</span>
          {t('footer.privacy')}
        </Link>
        <Link
          to={sourcesPath}
          className="text-secondary dark:text-dark-green hover:underline inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">library_books</span>
          {t('footer.sources')}
        </Link>
      </div>
    </PageShell>
  )
}
