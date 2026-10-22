import { describe, expect, it } from 'vitest'
import { sanitizeTafsirHtml } from '@/lib/utils/sanitizeHtml'

describe('sanitizeTafsirHtml', () => {
  it('keeps allowed structure and strips attributes', () => {
    const input =
      '<h1><span style="color: red;">Introduction</span></h1><h2 onclick="alert(1)">Names</h2><p>Hello</p>'
    const out = sanitizeTafsirHtml(input)
    expect(out).toContain('<h1 ')
    expect(out).toContain('<h2 ')
    expect(out).toContain('<p ')
    expect(out).not.toContain('style=')
    expect(out).not.toContain('onclick')
    expect(out).toContain('Introduction')
  })

  it('removes script tags entirely', () => {
    const out = sanitizeTafsirHtml('<p>Safe</p><script>alert(1)</script>')
    expect(out).toContain('Safe')
    expect(out).not.toContain('script')
    expect(out).not.toContain('alert')
  })

  it('adds rtl dir for Arabic paragraphs', () => {
    const out = sanitizeTafsirHtml('<p>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>')
    expect(out).toContain('dir="rtl"')
  })

  it('removes mXSS host elements instead of unwrapping them', () => {
    const payloads = [
      '<svg><p>keep</p></svg>',
      '<math><p>keep</p></math>',
      '<noscript><p>keep</p></noscript>',
      '<template><p>keep</p></template>',
      '<textarea><p>keep</p></textarea>',
      '<form><p>keep</p></form>',
      '<embed src="x">',
      '<link rel="stylesheet" href="x">',
    ]

    for (const input of payloads) {
      const out = sanitizeTafsirHtml(input)
      expect(out).not.toMatch(/<\/?(svg|math|noscript|template|textarea|form|embed|link)\b/i)
    }
  })
})
