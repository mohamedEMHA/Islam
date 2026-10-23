import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { HoverCard } from '@/components/motion/HoverCard'
import { cn } from '@/lib/utils/format'

interface SourceCard {
  id: 'aladhan' | 'quran' | 'fawaz' | 'duas' | 'sunnah' | 'ummah' | 'xaus'
  name: string
  url: string
  icon: string
  lastChecked: string
  nameKey?: string
}

const SOURCES: SourceCard[] = [
  {
    id: 'aladhan',
    name: 'AlAdhan API',
    url: 'https://aladhan.com/prayer-times-api',
    icon: 'schedule',
    lastChecked: '2026-08-30',
  },
  {
    id: 'quran',
    name: 'Quran.com API',
    url: 'https://quran.com',
    icon: 'menu_book',
    lastChecked: '2026-08-31',
  },
  {
    id: 'fawaz',
    name: 'fawazahmed0/hadith-api',
    url: 'https://github.com/fawazahmed0/hadith-api',
    icon: 'library_books',
    lastChecked: '2026-08-30',
  },
  {
    id: 'duas',
    name: 'Curated Duas & Adhkar',
    url: 'https://sunnah.com',
    icon: 'volunteer_activism',
    lastChecked: '2026-08-31',
    nameKey: 'pages.sources.cards.duas.name',
  },
  {
    id: 'sunnah',
    name: 'sunnah.com API',
    url: 'https://sunnah.com/developers',
    icon: 'verified',
    lastChecked: '2026-08-30',
  },
  {
    id: 'ummah',
    name: 'UmmahAPI',
    url: 'https://ummahapi.com',
    icon: 'calculate',
    lastChecked: '2026-08-31',
  },
  {
    id: 'xaus',
    name: 'XAUS.com',
    url: 'https://xaus.com/api',
    icon: 'payments',
    lastChecked: '2026-08-31',
  },
]

function SourceTile({
  source,
  name,
  category,
  quote,
  visitLabel,
  lastCheckedLabel,
  layout = 'marquee',
}: {
  source: SourceCard
  name: string
  category: string
  quote: string
  visitLabel: string
  lastCheckedLabel: string
  layout?: 'marquee' | 'grid'
}) {
  return (
    <HoverCard
      className={cn(
        'p-6 flex flex-col h-full dark:bg-dark-surface dark:border-dark-border',
        layout === 'grid' ? 'w-full min-h-[280px]' : 'w-[300px] sm:w-[340px] shrink-0',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-soft text-secondary dark:bg-dark-green/20 dark:text-dark-green">
          <span className="material-symbols-outlined text-[22px]">{source.icon}</span>
        </span>
        <span className="rounded-full border border-hairline dark:border-dark-border px-2.5 py-1 font-label-sm text-label-sm text-stone dark:text-dark-text-secondary">
          {category}
        </span>
      </div>

      <span
        className="material-symbols-outlined text-secondary/35 dark:text-dark-green/35 text-4xl leading-none mb-2"
        aria-hidden
      >
        format_quote
      </span>

      <blockquote className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed grow line-clamp-5">
        {quote}
      </blockquote>

      <div className="mt-5 pt-4 border-t border-hairline dark:border-dark-border flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text text-base truncate">
            {name}
          </p>
          <p className="font-label-sm text-label-sm text-stone dark:text-dark-text-secondary mt-0.5">
            {lastCheckedLabel}
          </p>
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary dark:text-dark-green hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {visitLabel}
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
    </HoverCard>
  )
}

export function SourcesPage() {
  const { t } = useTranslation()
  const loop = [...SOURCES, ...SOURCES]

  const resolveSource = (source: SourceCard) => ({
    name: source.nameKey ? t(source.nameKey) : source.name,
    category: t(`pages.sources.cards.${source.id}.category`),
    quote: t(`pages.sources.cards.${source.id}.quote`),
  })

  return (
    <PageShell title={t('pages.sources.title')} subtitle={t('pages.sources.subtitle')}>
      <p className="font-body-lg text-body-lg text-ink-soft dark:text-dark-text-secondary leading-relaxed mb-8 max-w-3xl">
        {t('pages.sources.intro')}
      </p>

      <section className="mb-10 max-w-3xl rounded-xl border border-hairline dark:border-dark-border p-5 md:p-6">
        <h2 className="font-heading-h3 text-heading-h3 text-ink-black dark:text-dark-text mb-3">
          {t('pages.sources.methodologyTitle')}
        </h2>
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
          {t('pages.sources.methodologyBody')}
        </p>
      </section>

      <section
        className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
        aria-label={t('pages.sources.title')}
      >
        {SOURCES.map((source) => {
          const localized = resolveSource(source)
          return (
            <SourceTile
              key={source.id}
              source={source}
              name={localized.name}
              category={localized.category}
              quote={localized.quote}
              layout="grid"
              visitLabel={t('pages.sources.visit')}
              lastCheckedLabel={t('pages.sources.lastChecked', { date: source.lastChecked })}
            />
          )
        })}
      </section>

      <section
        className="sources-marquee relative -mx-margin-mobile md:-mx-margin-desktop overflow-hidden hidden md:block"
        aria-label={t('pages.sources.title')}
      >
        <div
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-12 md:w-24 bg-gradient-to-r rtl:bg-gradient-to-l from-surface-container-low to-transparent dark:from-dark-bg"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-12 md:w-24 bg-gradient-to-l rtl:bg-gradient-to-r from-surface-container-low to-transparent dark:from-dark-bg"
          aria-hidden
        />

        <div className="sources-marquee-track flex gap-4 md:gap-5 px-margin-mobile md:px-margin-desktop py-2">
          {loop.map((source, index) => {
            const localized = resolveSource(source)
            return (
              <div
                key={`${source.id}-${index}`}
                className="h-[280px]"
                aria-hidden={index >= SOURCES.length ? true : undefined}
              >
                <SourceTile
                  source={source}
                  name={localized.name}
                  category={localized.category}
                  quote={localized.quote}
                  visitLabel={t('pages.sources.visit')}
                  lastCheckedLabel={t('pages.sources.lastChecked', { date: source.lastChecked })}
                />
              </div>
            )
          })}
        </div>
      </section>

      <ul className="sr-only">
        {SOURCES.map((source) => {
          const localized = resolveSource(source)
          return (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {localized.name}: {localized.quote}
              </a>
            </li>
          )
        })}
      </ul>
    </PageShell>
  )
}
