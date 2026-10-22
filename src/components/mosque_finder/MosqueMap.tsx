import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import { useTranslation } from 'react-i18next'

import type { Mosque } from '@/lib/api/overpass'
import { getDirectionsUrl, getOsmUrl } from '@/lib/api/overpass'
import { formatDistanceMeters } from '@/lib/utils/haversine'
import { useSettingsStore } from '@/lib/stores/settingsStore'

import 'leaflet/dist/leaflet.css'

interface MosqueMapProps {
  userLat: number
  userLng: number
  mosques: Mosque[]
  className?: string
}

const DARK_TILES =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const LIGHT_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildPopupHtml(mosque: Mosque, t: (key: string) => string): string {
  const addressLine = mosque.address
    ? `<p class="text-sm text-stone mb-2">${escapeHtml(mosque.address)}</p>`
    : ''
  const distanceLine = `<p class="text-sm font-medium mb-2">${escapeHtml(
    formatDistanceMeters(mosque.distanceMeters),
  )}</p>`
  const osmUrl = escapeHtml(getOsmUrl(mosque))
  const directionsUrl = escapeHtml(getDirectionsUrl(mosque.latitude, mosque.longitude))

  return `
    <div class="min-w-[180px]">
      <p class="font-semibold mb-1">${escapeHtml(mosque.name)}</p>
      ${addressLine}
      ${distanceLine}
      <div class="flex flex-col gap-1 text-sm">
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="text-secondary hover:underline">
          ${escapeHtml(t('pages.mosqueFinder.directions'))}
        </a>
        <a href="${osmUrl}" target="_blank" rel="noopener noreferrer" class="text-secondary hover:underline">
          ${escapeHtml(t('pages.mosqueFinder.viewOnOsm'))}
        </a>
      </div>
    </div>
  `
}

function updateMosqueMarkers(
  L: typeof import('leaflet'),
  map: LeafletMap,
  markers: LeafletMarker[],
  items: Mosque[],
  translate: (key: string) => string,
): LeafletMarker[] {
  for (const marker of markers) {
    marker.remove()
  }

  const mosqueIcon = L.divIcon({
    className: 'mosque-finder-mosque-marker',
    html: '<div style="width:12px;height:12px;border-radius:2px;background:#14532d;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.35)"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })

  return items.map((mosque) =>
    L.marker([mosque.latitude, mosque.longitude], { icon: mosqueIcon })
      .addTo(map)
      .bindPopup(buildPopupHtml(mosque, translate)),
  )
}

export function MosqueMap({ userLat, userLng, mosques, className }: MosqueMapProps) {
  const { t } = useTranslation()
  const theme = useSettingsStore((s) => s.theme)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const userMarkerRef = useRef<LeafletMarker | null>(null)
  const mosqueMarkersRef = useRef<LeafletMarker[]>([])
  const mosquesRef = useRef(mosques)
  mosquesRef.current = mosques

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      const L = await import('leaflet')

      if (cancelled || !containerRef.current) return

      mapRef.current?.remove()
      mosqueMarkersRef.current = []
      userMarkerRef.current = null

      const map = L.map(containerRef.current, {
        center: [userLat, userLng],
        zoom: 14,
        scrollWheelZoom: true,
      })

      const tileUrl = theme === 'dark' ? DARK_TILES : LIGHT_TILES
      const attribution =
        theme === 'dark'
          ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

      L.tileLayer(tileUrl, {
        attribution,
        maxZoom: 19,
      }).addTo(map)

      const userIcon = L.divIcon({
        className: 'mosque-finder-user-marker',
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 0 0 2px rgba(37,99,235,0.35)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(t('pages.mosqueFinder.yourLocation'))

      mosqueMarkersRef.current = updateMosqueMarkers(
        L,
        map,
        [],
        mosquesRef.current,
        t,
      )
      mapRef.current = map
    }

    void initMap()

    return () => {
      cancelled = true
      mosqueMarkersRef.current = []
      userMarkerRef.current = null
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [theme, t, userLat, userLng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.setView([userLat, userLng], map.getZoom())
    userMarkerRef.current?.setLatLng([userLat, userLng])

    void import('leaflet').then((L) => {
      mosqueMarkersRef.current = updateMosqueMarkers(
        L,
        map,
        mosqueMarkersRef.current,
        mosques,
        t,
      )
    })
  }, [userLat, userLng, mosques, t])

  return (
    <div
      ref={containerRef}
      className={className}
      role="application"
      aria-label={t('pages.mosqueFinder.mapLabel')}
    />
  )
}
