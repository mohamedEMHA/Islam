import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { LocalizedLink } from '@/components/routing/LocalizedLink'
import { PageShell } from '@/components/ui/PageShell'
import { Input } from '@/components/ui/Input'
import { HoverCard } from '@/components/motion/HoverCard'
import { StaggerList, StaggerListItem } from '@/components/motion/StaggerList'
import { getSurahList } from '@/lib/api/quran'
import { searchHadithAll, HADITH_COLLECTIONS } from '@/lib/api/hadith'
import { buildHadithReaderPath } from '@/lib/utils/sunnahParsers'
import { getDuasByCategory } from '@/lib/api/duas'
import type { SurahMeta } from '@/types/quran'
import type { HadithEntry } from '@/types/hadith'
import type { Dua } from '@/lib/api/duas'

export function SearchPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [surahs, setSurahs] = useState<SurahMeta[]>([])
  const [hadithResults, setHadithResults] = useState<HadithEntry[]>([])
  const [duas, setDuas] = useState<Dua[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQuery((prev) => (prev === q ? prev : q))
  }, [searchParams])

  useEffect(() => {
    getSurahList().then(setSurahs).catch(console.error)
    Promise.all([
      getDuasByCategory('morning'),
      getDuasByCategory('evening'),
      getDuasByCategory('travel'),
    ]).then((groups) => setDuas(groups.flat()))
  }, [])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (value.trim()) {
      setSearchParams({ q: value }, { replace: true, preventScrollReset: true })
    } else {
      setSearchParams({}, { replace: true, preventScrollReset: true })
    }
  }

  const quranResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.name.includes(query) ||
        String(s.number).includes(q),
    ).slice(0, 10)
  }, [surahs, query])

  const duaResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return duas.filter(
      (d) =>
        d.translation.toLowerCase().includes(q) ||
        d.arabic.includes(query) ||
        d.id.toLowerCase().includes(q),
    ).slice(0, 10)
  }, [duas, query])

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setHadithResults([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true)
      searchHadithAll(query, 8, controller.signal)
        .then((results) => {
          setHadithResults(results)
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setHadithResults([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 400)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  const hasResults = quranResults.length > 0 || hadithResults.length > 0 || duaResults.length > 0

  return (
    <PageShell title={t('pages.search.title')} subtitle={t('pages.search.subtitle')}>
      <form
        role="search"
        className="mb-8"
        onSubmit={(e) => {
          e.preventDefault()
          const trimmed = query.trim()
          if (trimmed) {
            setSearchParams({ q: trimmed }, { replace: true })
          } else {
            setSearchParams({}, { replace: true })
          }
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          {t('common.search')}
        </label>
        <Input
          id="site-search"
          type="search"
          name="q"
          placeholder={t('pages.search.placeholder')}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          autoComplete="off"
        />
      </form>
      {!query.trim() && (
        <p className="font-body-md text-body-md text-stone">{t('pages.search.hint')}</p>
      )}
      {query.trim() && !loading && !hasResults && (
        <p className="font-body-md text-body-md text-stone">{t('pages.search.noResults')}</p>
      )}
      {quranResults.length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black mb-4">{t('pages.search.quran')}</h2>
          <StaggerList className="space-y-2">
            {quranResults.map((s) => (
              <StaggerListItem key={s.number}>
              <LocalizedLink to={`/quran/${s.number}`}>
                <HoverCard className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
                  <span className="font-medium text-ink-black truncate min-w-0">{s.number}. {s.englishName}</span>
                  <span dir="rtl" className="font-arabic-quran text-primary shrink-0 sm:text-end truncate">{s.name}</span>
                </HoverCard>
              </LocalizedLink>
              </StaggerListItem>
            ))}
          </StaggerList>
        </section>
      )}
      {hadithResults.length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black mb-4">{t('pages.search.hadith')}</h2>
          <StaggerList className="space-y-2">
            {hadithResults.map((h) => (
              <StaggerListItem key={`${h.collection}:${h.id}`}>
              <LocalizedLink
                to={buildHadithReaderPath(h.collection, h.id, {
                  book: h.bookNumber,
                })}
              >
                <HoverCard className="p-4">
                  <p className="font-label-sm text-label-sm text-secondary mb-1">
                    {HADITH_COLLECTIONS.find((c) => c.id === h.collection)?.name} #{h.id}
                  </p>
                  <p className="font-body-md text-body-md text-ink-soft line-clamp-2">{h.english}</p>
                </HoverCard>
              </LocalizedLink>
              </StaggerListItem>
            ))}
          </StaggerList>
        </section>
      )}
      {duaResults.length > 0 && (
        <section>
          <h2 className="font-heading-h3 text-heading-h3 text-ink-black mb-4">{t('pages.search.duas')}</h2>
          <StaggerList className="space-y-2">
            {duaResults.map((d) => (
              <StaggerListItem key={d.id}>
              <LocalizedLink to="/duas">
                <HoverCard className="p-4">
                  <p className="font-body-md text-body-md text-ink-soft line-clamp-2">{d.translation}</p>
                </HoverCard>
              </LocalizedLink>
              </StaggerListItem>
            ))}
          </StaggerList>
        </section>
      )}
    </PageShell>
  )
}
