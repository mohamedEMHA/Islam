const ALLOWED_TAGS = new Set([
  'h1',
  'h2',
  'h3',
  'h4',
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'ul',
  'ol',
  'li',
  'blockquote',
  'span',
])

/** Remove entirely (do not unwrap) — unwrapping enables mXSS in some browsers. */
const REMOVE_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'svg',
  'math',
  'noscript',
  'template',
  'textarea',
  'form',
])

function isMostlyArabic(text: string): boolean {
  const letters = text.replace(/\s+/g, '')
  if (!letters) return false
  const arabic = (letters.match(/[\u0600-\u06FF]/g) ?? []).length
  return arabic / letters.length >= 0.4
}

function unwrapElement(el: Element): void {
  const parent = el.parentNode
  if (!parent) return
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el)
  }
  parent.removeChild(el)
}

function sanitizeNode(node: Node): void {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    const tag = el.tagName.toLowerCase()

    if (!ALLOWED_TAGS.has(tag)) {
      if (REMOVE_TAGS.has(tag)) {
        el.remove()
        return
      }
      const children = [...el.childNodes]
      unwrapElement(el)
      for (const child of children) {
        sanitizeNode(child)
      }
      return
    }

    for (const attr of [...el.attributes]) {
      el.removeAttribute(attr.name)
    }

    if (tag !== 'br' && isMostlyArabic(el.textContent ?? '')) {
      el.setAttribute('dir', 'rtl')
    } else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'p') {
      el.setAttribute('dir', 'auto')
    }

    for (const child of [...el.childNodes]) {
      sanitizeNode(child)
    }
    return
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    node.parentNode?.removeChild(node)
  }
}

/** Allowlist sanitize for Quran.com tafsir HTML. Strips attrs/styles; sets dir on Arabic blocks. */
export function sanitizeTafsirHtml(html: string): string {
  if (!html.trim()) return ''

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const body = doc.body

  for (const child of [...body.childNodes]) {
    sanitizeNode(child)
  }

  body.querySelectorAll('p, span, h1, h2, h3, h4').forEach((el) => {
    if (!(el.textContent ?? '').trim() && !el.querySelector('br')) {
      el.remove()
    }
  })

  return body.innerHTML.trim()
}
