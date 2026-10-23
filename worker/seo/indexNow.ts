import { SITE_URL } from '../../shared/seo/locale.ts'

/** Public IndexNow key (also served at /{key}.txt). Generate once; keep stable. */
export const INDEXNOW_KEY = 'islamhouseindexnow9f3a2c1b'

export function indexNowKeyFileBody(): string {
  return INDEXNOW_KEY
}

export function indexNowKeyPath(): string {
  return `/${INDEXNOW_KEY}.txt`
}

/** Notify Bing/Yandex IndexNow for a batch of absolute URLs (fire-and-forget from deploy). */
export async function pingIndexNow(urls: string[]): Promise<{ ok: boolean; status: number }> {
  if (urls.length === 0) return { ok: true, status: 200 }
  const host = new URL(SITE_URL).host
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}${indexNowKeyPath()}`,
    urlList: urls.slice(0, 10_000),
  }
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })
    return { ok: res.ok || res.status === 202, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}
