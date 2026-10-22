import { SITE_URL } from '../../shared/seo/locale.ts'

/** RFC 9116 security.txt. Expires one year from build time. */
export function securityTxt(now = new Date()): string {
  const expires = new Date(now)
  expires.setUTCFullYear(expires.getUTCFullYear() + 1)
  return [
    `Contact: mailto:security@islam.house`,
    `Expires: ${expires.toISOString()}`,
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    `Preferred-Languages: en, ar`,
    '',
  ].join('\n')
}
