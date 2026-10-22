import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { ArabicText } from '@/components/content/ArabicText'
import { SHAHADA_FULL_ARABIC, SHAHADA_PARTS } from '@/lib/data/shahada'

export function ShahadaPage() {
  const { t } = useTranslation()

  return (
    <PageShell
      title={t('pages.shahada.title')}
      subtitle={t('pages.shahada.subtitle')}
    >
      <div className="space-y-8">
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
          {t('pages.shahada.intro')}
        </p>

        <HoverCard className="p-6 md:p-8 text-center bg-surface-container-low dark:bg-dark-bg border border-hairline dark:border-dark-border">
          <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-6">
            {t('pages.shahada.fullDeclaration')}
          </p>
          <ArabicText size="lg" className="text-primary dark:text-dark-green mb-6">
            {SHAHADA_FULL_ARABIC}
          </ArabicText>
          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary italic mb-4">
            {t('pages.shahada.fullTransliteration')}
          </p>
          <p className="font-body-lg text-body-lg text-ink-black dark:text-dark-text leading-relaxed">
            {t('pages.shahada.fullTranslation')}
          </p>
        </HoverCard>

        <div>
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-4">
            {t('pages.shahada.partsTitle')}
          </h2>
          <StaggerList className="space-y-4">
            {SHAHADA_PARTS.map((part, index) => (
              <StaggerListItem key={part.id}>
              <HoverCard
                className="p-5 md:p-6 border border-hairline dark:border-dark-border"
              >
                <p className="font-label-sm text-label-sm text-stone mb-3">
                  {t('pages.shahada.partLabel', { number: index + 1 })}
                </p>
                <ArabicText className="text-primary dark:text-dark-green mb-4">
                  {part.arabic}
                </ArabicText>
                <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary italic mb-2">
                  {t(part.transliterationKey)}
                </p>
                <p className="font-body-md text-body-md text-ink-black dark:text-dark-text">
                  {t(part.translationKey)}
                </p>
              </HoverCard>
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>

        <HoverCard className="p-5 md:p-6 border border-hairline dark:border-dark-border">
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-3">
            {t('pages.shahada.meaningTitle')}
          </h2>
          <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
            {t('pages.shahada.meaningBody')}
          </p>
        </HoverCard>
      </div>
    </PageShell>
  )
}
