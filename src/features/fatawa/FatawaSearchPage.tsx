import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/ui/PageShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { HoverCard } from '@/components/motion/HoverCard'

function openIslamqaSearch(query: string) {
  const url = `https://islamqa.info/en/search?q=${encodeURIComponent(query)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function FatawaSearchPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) openIslamqaSearch(trimmed)
  }

  return (
    <PageShell title={t('pages.fatawa.title')} subtitle={t('pages.fatawa.subtitle')}>
      <HoverCard className="p-6 mb-6 dark:bg-dark-surface dark:border-dark-border">
        <p className="font-body-md text-body-md text-ink-soft dark:text-dark-text-secondary leading-relaxed">
          {t('pages.fatawa.notice')}
        </p>
      </HoverCard>

      <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={handleSubmit}>
        <Input
          placeholder={t('pages.fatawa.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="primary" disabled={!query.trim()}>
          {t('pages.fatawa.search')}
        </Button>
      </form>

      <div className="space-y-3">
        <a
          href="https://islamqa.info"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <HoverCard className="p-5 dark:bg-dark-surface dark:border-dark-border">
            <p className="font-body-lg text-body-lg text-ink-black dark:text-dark-text">IslamQA</p>
            <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary mt-1">
              {t('pages.fatawa.externalIslamqa')}
            </p>
          </HoverCard>
        </a>
        <a
          href="https://www.dar-alifta.org"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <HoverCard className="p-5 dark:bg-dark-surface dark:border-dark-border">
            <p className="font-body-lg text-body-lg text-ink-black dark:text-dark-text">Dar Al Ifta</p>
            <p className="font-body-md text-body-md text-stone dark:text-dark-text-secondary mt-1">
              {t('pages.fatawa.externalDarAlIfta')}
            </p>
          </HoverCard>
        </a>
      </div>
    </PageShell>
  )
}
