import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'

const LIBRARY_LINKS = [
  {
    id: 'shamela',
    titleKey: 'pages.islamicLibrary.shamelaTitle',
    descKey: 'pages.islamicLibrary.shamelaDesc',
    url: 'https://shamela.ws',
  },
  {
    id: 'openiti',
    titleKey: 'pages.islamicLibrary.openitiTitle',
    descKey: 'pages.islamicLibrary.openitiDesc',
    url: 'https://openiti.org',
  },
  {
    id: 'sunnah',
    titleKey: 'pages.islamicLibrary.sunnahTitle',
    descKey: 'pages.islamicLibrary.sunnahDesc',
    url: 'https://sunnah.com',
  },
  {
    id: 'quran',
    titleKey: 'pages.islamicLibrary.quranTitle',
    descKey: 'pages.islamicLibrary.quranDesc',
    url: 'https://quran.com',
  },
]

export function IslamicLibraryPage() {
  const { t } = useTranslation()

  return (
    <PageShell title={t('pages.islamicLibrary.title')} subtitle={t('pages.islamicLibrary.subtitle')}>
      <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary mb-6 leading-relaxed">
        {t('pages.islamicLibrary.intro')}
      </p>

      <StaggerList className="space-y-3">
        {LIBRARY_LINKS.map((link) => (
          <StaggerListItem key={link.id}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
              <HoverCard className="p-5 dark:bg-dark-surface dark:border-dark-border">
                <p className="font-body-lg text-body-lg text-ink-black dark:text-dark-text">
                  {t(link.titleKey)}
                </p>
                <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary mt-1">
                  {t(link.descKey)}
                </p>
              </HoverCard>
            </a>
          </StaggerListItem>
        ))}
      </StaggerList>
    </PageShell>
  )
}
