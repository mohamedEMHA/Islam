import type { ResolvedSeo } from '../../shared/seo/resolve.ts'
import { localizedPath } from '../../shared/seo/locale.ts'
import { jsonLdScriptTag } from './schema.ts'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildHeadExtras(seo: ResolvedSeo, nonce?: string): string {
  const robots = seo.noIndex ? 'noindex,nofollow' : 'index,follow'
  const ogImage = 'https://islam.house/og_image.png'
  const links = seo.alternates
    .map(
      (alt) =>
        `<link rel="alternate" hreflang="${escapeHtml(alt.hreflang)}" href="${escapeHtml(alt.href)}" />`,
    )
    .join('')

  return [
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`,
    links,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    jsonLdScriptTag(seo, nonce),
  ].join('')
}

export function buildRootContent(seo: ResolvedSeo): string {
  const home = localizedPath('/', seo.locale)
  const quran = localizedPath('/quran', seo.locale)
  const prayer = localizedPath('/prayer_times', seo.locale)
  const hadith = localizedPath('/hadith', seo.locale)
  const rich = seo.richText
    ? `<div class="seo-rich"><p>${escapeHtml(seo.richText)}</p></div>`
    : ''

  const crumbs = seo.breadcrumbs
    .map((c) => {
      const href = localizedPath(c.path, seo.locale)
      return `<a href="${escapeHtml(href)}">${escapeHtml(c.name)}</a>`
    })
    .join(' / ')

  return [
    `<main id="seo-content" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">`,
    `<nav aria-label="Breadcrumb">${crumbs}</nav>`,
    `<h1>${escapeHtml(seo.h1)}</h1>`,
    `<p>${escapeHtml(seo.body)}</p>`,
    rich,
    `<nav aria-label="Related">`,
    `<ul>`,
    `<li><a href="${escapeHtml(home)}">Home</a></li>`,
    `<li><a href="${escapeHtml(prayer)}">Prayer Times</a></li>`,
    `<li><a href="${escapeHtml(quran)}">Quran</a></li>`,
    `<li><a href="${escapeHtml(hadith)}">Hadith</a></li>`,
    `</ul>`,
    `</nav>`,
    `</main>`,
  ].join('')
}

class TitleHandler {
  constructor(private title: string) {}
  element(element: Element) {
    element.setInnerContent(this.title)
  }
}

class HtmlLangHandler {
  constructor(
    private lang: string,
    private dir: string,
  ) {}
  element(element: Element) {
    element.setAttribute('lang', this.lang)
    element.setAttribute('dir', this.dir)
  }
}

class HeadInjectHandler {
  constructor(private extras: string) {}
  element(element: Element) {
    element.append(this.extras, { html: true })
  }
}

class MetaStripHandler {
  element(element: Element) {
    const name = element.getAttribute('name')
    const property = element.getAttribute('property')
    if (
      name === 'description' ||
      name === 'twitter:card' ||
      name === 'twitter:title' ||
      name === 'twitter:description' ||
      name === 'twitter:image' ||
      name === 'robots' ||
      property === 'og:type' ||
      property === 'og:title' ||
      property === 'og:description' ||
      property === 'og:url' ||
      property === 'og:image' ||
      property === 'og:image:width' ||
      property === 'og:image:height'
    ) {
      element.remove()
    }
  }
}

class LinkStripHandler {
  constructor(private keepHeroPreload: boolean) {}
  element(element: Element) {
    const rel = element.getAttribute('rel')
    if (rel === 'canonical') {
      element.remove()
      return
    }
    // Hero image is only used on the home page; drop global preload elsewhere.
    if (
      !this.keepHeroPreload &&
      rel === 'preload' &&
      /\/brand\/screen\.(png|webp|avif)/.test(element.getAttribute('href') ?? '')
    ) {
      element.remove()
    }
  }
}

class JsonLdStripHandler {
  element(element: Element) {
    if (element.getAttribute('type') === 'application/ld+json') {
      element.remove()
    }
  }
}

class ScriptNonceHandler {
  constructor(private nonce: string) {}
  element(element: Element) {
    if (element.getAttribute('type') === 'application/ld+json') return
    element.setAttribute('nonce', this.nonce)
  }
}

class RootHandler {
  constructor(private html: string) {}
  element(element: Element) {
    element.setInnerContent(this.html, { html: true })
  }
}

/** Rewrite SPA shell HTML with per-route SEO for crawlers and first paint. */
export function injectSeo(response: Response, seo: ResolvedSeo, nonce?: string): Response {
  const extras = buildHeadExtras(seo, nonce)
  const rootHtml = buildRootContent(seo)

  let rewriter = new HTMLRewriter()
    .on('html', new HtmlLangHandler(seo.locale, seo.dir))
    .on('title', new TitleHandler(seo.title))
    .on('meta', new MetaStripHandler())
    .on('link', new LinkStripHandler(seo.pathWithoutLocale === '/'))
    .on('script', new JsonLdStripHandler())
    .on('head', new HeadInjectHandler(extras))
    .on('#root', new RootHandler(rootHtml))

  if (nonce) {
    rewriter = rewriter.on('script', new ScriptNonceHandler(nonce))
  }

  const rewritten = rewriter.transform(response)

  const headers = new Headers(rewritten.headers)
  headers.set('Content-Type', 'text/html; charset=utf-8')
  if (seo.noIndex) {
    headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return new Response(rewritten.body, {
    status: seo.status,
    statusText: seo.status === 404 ? 'Not Found' : rewritten.statusText,
    headers,
  })
}
