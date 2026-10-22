import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  absoluteUrl,
  getSiteUrlCompat,
  hreflangAlternates,
  localizedPath,
  parseLocalePath,
} from './pageMetaShared'
import { NOINDEX_PATHS } from '@shared/seo/copy'

export { getSiteUrlCompat as getSiteUrl }

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function syncHreflang(pathWithoutLocale: string, site: string) {
  document.querySelectorAll('link[data-seo-hreflang="1"]').forEach((el) => el.remove())
  for (const alt of hreflangAlternates(pathWithoutLocale, site)) {
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.hreflang = alt.hreflang
    link.href = alt.href
    link.setAttribute('data-seo-hreflang', '1')
    document.head.appendChild(link)
  }
}

function readMetaContent(attr: 'name' | 'property', key: string): string | null {
  const el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  return el?.content ?? null
}

function readCanonicalHref(): string | null {
  const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  return link?.href ?? null
}

export interface PageMetaOptions {
  title: string
  description?: string
  /** Path without locale prefix preferred; locale is taken from the current URL. */
  path?: string
  image?: string
  noIndex?: boolean
}

export function usePageMeta({ title, description, path, image, noIndex }: PageMetaOptions) {
  const { pathname } = useLocation()

  useEffect(() => {
    const previousTitle = document.title
    const previousRobots = readMetaContent('name', 'robots')
    const previousCanonical = readCanonicalHref()

    const site = getSiteUrlCompat()
    const fullTitle = title.includes('Islam') ? title : `${title} | Islam`
    document.title = fullTitle

    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
      setMeta('name', 'twitter:description', description)
    }

    setMeta('property', 'og:title', fullTitle)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('property', 'og:type', 'website')
    setMeta('name', 'twitter:card', 'summary_large_image')

    const { locale, pathWithoutLocale: fromUrl } = parseLocalePath(pathname)
    const pathWithoutLocale = path
      ? parseLocalePath(path.startsWith('/') ? path : `/${path}`).pathWithoutLocale
      : fromUrl

    const finalCanonicalPath = localizedPath(pathWithoutLocale, locale)
    const canonical = absoluteUrl(finalCanonicalPath, site)
    setCanonical(canonical)
    setMeta('property', 'og:url', canonical)
    syncHreflang(pathWithoutLocale, site)

    const ogImage = image ?? `${site}/og_image.png`
    setMeta('property', 'og:image', ogImage)
    setMeta('name', 'twitter:image', ogImage)

    const shouldNoIndex = noIndex ?? NOINDEX_PATHS.has(pathWithoutLocale)
    if (shouldNoIndex) {
      setMeta('name', 'robots', 'noindex,nofollow')
    } else {
      setMeta('name', 'robots', 'index,follow')
    }

    return () => {
      document.title = previousTitle
      if (previousRobots !== null) {
        setMeta('name', 'robots', previousRobots)
      } else {
        document.querySelector('meta[name="robots"]')?.remove()
      }
      if (previousCanonical !== null) {
        setCanonical(previousCanonical)
      } else {
        document.querySelector('link[rel="canonical"]')?.remove()
      }
      document.querySelectorAll('link[data-seo-hreflang="1"]').forEach((el) => el.remove())
    }
  }, [title, description, path, image, noIndex, pathname])
}
