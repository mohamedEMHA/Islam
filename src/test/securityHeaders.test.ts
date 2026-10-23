import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  SECURITY_HEADERS,
  THEME_SCRIPT_SHA256,
  buildContentSecurityPolicy,
  buildSecurityHeaders,
} from '../../worker/securityHeaders'

function themeScriptBodyFromIndexHtml(): string {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
  const match = html.match(
    /<script(?![^>]*\bsrc=)(?![^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/i,
  )
  if (!match?.[1]) {
    throw new Error('Inline theme script not found in index.html')
  }
  return match[1]
}

function cspFromPublicHeaders(): string {
  const raw = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8')
  const match = raw.match(/Content-Security-Policy:\s*(.+)/)
  if (!match?.[1]) {
    throw new Error('Content-Security-Policy missing from public/_headers')
  }
  return match[1].trim()
}

describe('security headers', () => {
  it('keeps THEME_SCRIPT_SHA256 in sync with index.html', () => {
    const body = themeScriptBodyFromIndexHtml()
    const hash = `sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}`
    expect(THEME_SCRIPT_SHA256).toBe(hash)
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain(`'${hash}'`)
  })

  it('drops unsafe-inline from script-src and sets HSTS', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy']
    const scriptSrc = csp.split('; ').find((part) => part.startsWith('script-src '))
    expect(scriptSrc).toBeDefined()
    expect(scriptSrc).not.toContain("'unsafe-inline'")
    expect(scriptSrc).toContain(`'${THEME_SCRIPT_SHA256}'`)
    expect(SECURITY_HEADERS['Strict-Transport-Security']).toBe(
      'max-age=31536000; includeSubDomains',
    )
  })

  it('keeps public/_headers CSP aligned with default SECURITY_HEADERS CSP', () => {
    expect(cspFromPublicHeaders()).toBe(SECURITY_HEADERS['Content-Security-Policy'])
  })

  it('embeds nonce in CSP when provided', () => {
    const csp = buildContentSecurityPolicy('test-nonce')
    expect(csp).toContain("'nonce-test-nonce'")
    expect(buildSecurityHeaders('test-nonce')['Content-Security-Policy']).toBe(csp)
  })

  it('denies framing by default', () => {
    const headers = buildSecurityHeaders()
    expect(headers['X-Frame-Options']).toBe('DENY')
    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'")
  })

  it('allows framing only when allowFraming is set (embed)', () => {
    const headers = buildSecurityHeaders(undefined, { allowFraming: true })
    expect(headers['X-Frame-Options']).toBeUndefined()
    expect(headers['Content-Security-Policy']).toContain('frame-ancestors *')
    expect(headers['Content-Security-Policy']).not.toContain("frame-ancestors 'none'")
  })
})
