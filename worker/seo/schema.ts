import type { ResolvedSeo } from '../../shared/seo/resolve.ts'
import { SITE_URL, localizedPath } from '../../shared/seo/locale.ts'
import { faqPageJsonLd } from './faq.ts'

const SAME_AS = [
  'https://islam.house',
  // Add social / Wikidata URLs when profiles exist:
  // 'https://www.wikidata.org/wiki/Q…',
]

function breadcrumbJsonLd(seo: ResolvedSeo): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: seo.breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${localizedPath(crumb.path, seo.locale)}`,
    })),
  }
}

function websiteJsonLd(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'islam.house',
    alternateName: 'Islam',
    url: `${SITE_URL}/`,
    description:
      'Accurate prayer times, the full Quran, authenticated hadith, and daily duas, sourced transparently and free.',
    inLanguage: ['en', 'ar', 'ur', 'id', 'fr'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

function organizationJsonLd(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'islam.house',
    alternateName: 'Islam',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icons/icon_512.png`,
    sameAs: SAME_AS,
  }
}

function withDates(entity: Record<string, unknown>, seo: ResolvedSeo): Record<string, unknown> {
  if (seo.dateModified) {
    entity.dateModified = seo.dateModified
  }
  return entity
}

function pageEntity(seo: ResolvedSeo): Record<string, unknown> | null {
  if (seo.kind === 'surah' && seo.surah) {
    return withDates(
      {
        '@type': 'Chapter',
        name: `Surah ${seo.surah.nameLatin}`,
        alternateName: seo.surah.nameArabic,
        position: seo.surah.number,
        description: seo.description,
        url: seo.canonicalUrl,
        isPartOf: {
          '@type': 'Book',
          name: 'The Holy Quran',
          url: `${SITE_URL}${localizedPath('/quran', seo.locale)}`,
        },
      },
      seo,
    )
  }

  if (seo.kind === 'tafsir_surah' && seo.surah) {
    return withDates(
      {
        '@type': 'Article',
        headline: seo.h1,
        description: seo.description,
        url: seo.canonicalUrl,
        about: {
          '@type': 'Chapter',
          name: `Surah ${seo.surah.nameLatin}`,
          position: seo.surah.number,
        },
      },
      seo,
    )
  }

  if (seo.kind === 'hadith_entry') {
    return withDates(
      {
        '@type': 'Quotation',
        name: seo.h1,
        description: seo.description,
        url: seo.canonicalUrl,
        text: seo.richText,
        citation: {
          '@type': 'CreativeWork',
          name: seo.hadithCollectionId,
          url: `${SITE_URL}${localizedPath(`/hadith/${seo.hadithCollectionId}`, seo.locale)}`,
        },
        isPartOf: {
          '@type': 'Book',
          name: seo.hadithCollectionId,
          url: `${SITE_URL}${localizedPath(`/hadith/${seo.hadithCollectionId}`, seo.locale)}`,
        },
      },
      seo,
    )
  }

  if (seo.kind === 'prayer_city' || seo.kind === 'qibla_city' || seo.kind === 'ramadan_city') {
    return withDates(
      {
        '@type': 'WebPage',
        name: seo.title,
        description: seo.description,
        url: seo.canonicalUrl,
        about: seo.city
          ? {
              '@type': 'Place',
              name: seo.city.nameEn,
              geo: {
                '@type': 'GeoCoordinates',
                latitude: seo.city.lat,
                longitude: seo.city.lng,
              },
            }
          : undefined,
      },
      seo,
    )
  }

  if (
    seo.pathWithoutLocale === '/zakat' ||
    seo.pathWithoutLocale === '/inheritance' ||
    seo.pathWithoutLocale === '/qibla' ||
    seo.pathWithoutLocale === '/'
  ) {
    return withDates(
      {
        '@type': 'WebApplication',
        name: 'islam.house',
        url: seo.canonicalUrl,
        description: seo.description,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      seo,
    )
  }

  return withDates(
    {
      '@type': 'WebPage',
      name: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
    },
    seo,
  )
}

export function buildJsonLdGraph(seo: ResolvedSeo): Record<string, unknown> {
  const graph: Record<string, unknown>[] = [websiteJsonLd(), organizationJsonLd(), breadcrumbJsonLd(seo)]
  if (seo.pathWithoutLocale === '/') {
    graph.push(faqPageJsonLd(seo.locale))
  }
  const entity = pageEntity(seo)
  if (entity) graph.push(entity)
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function jsonLdScriptTag(seo: ResolvedSeo, nonce?: string): string {
  const json = JSON.stringify(buildJsonLdGraph(seo)).replace(/</g, '\\u003c')
  const nonceAttr = nonce ? ` nonce="${nonce}"` : ''
  return `<script type="application/ld+json"${nonceAttr}>${json}</script>`
}
