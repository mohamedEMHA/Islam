import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCityBySlug, SEO_CITIES } from '@shared/seo/cities'
import { getPrayerTimes } from '@/lib/api/aladhan'
import { PRAYER_ORDER } from '@/types/prayer'
import type { PrayerTimesResponse } from '@/types/prayer'

/**
 * Minimal embeddable prayer times for mosque sites.
 * Usage: <iframe src="https://islam.house/embed/prayer_times?city=london" width="320" height="360"></iframe>
 */
export function PrayerTimesEmbedPage() {
  const [params] = useSearchParams()
  const slug = params.get('city') ?? 'mecca'
  const city = getCityBySlug(slug) ?? SEO_CITIES[0]
  const [data, setData] = useState<PrayerTimesResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    getPrayerTimes({ latitude: city.lat, longitude: city.lng })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
    return () => {
      cancelled = true
    }
  }, [city])

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: 16,
        maxWidth: 360,
        margin: '0 auto',
        color: '#1a1a1a',
        background: '#faf8f5',
      }}
    >
      <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>
        Prayer times · {city.nameEn}
      </p>
      {data ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {PRAYER_ORDER.map((name) => (
            <li
              key={name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid #e5e0d8',
                fontSize: 14,
              }}
            >
              <span>{name}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{data.timings[name]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: 13 }}>Loading…</p>
      )}
      <p style={{ marginTop: 12, fontSize: 11 }}>
        <a href="https://islam.house" target="_blank" rel="noopener noreferrer" style={{ color: '#0d6b4c' }}>
          islam.house
        </a>
      </p>
    </div>
  )
}
