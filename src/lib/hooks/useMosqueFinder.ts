import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  DEFAULT_RADIUS_M,
  fetchNearbyMosques,
  OverpassError,
  type Mosque,
} from '@/lib/api/overpass'
import { useSettingsStore } from '@/lib/stores/settingsStore'

export const RADIUS_OPTIONS = [1000, 3000, 5000, 10000] as const
export type RadiusMeters = (typeof RADIUS_OPTIONS)[number]

export type LocationSource = 'geolocation' | 'settings' | null

export interface MosqueFinderLocation {
  latitude: number
  longitude: number
  label?: string
  source: LocationSource
}

interface UseMosqueFinderResult {
  mosques: Mosque[]
  location: MosqueFinderLocation | null
  radiusM: RadiusMeters
  setRadiusM: (radius: RadiusMeters) => void
  loading: boolean
  locating: boolean
  error: string | null
  errorCode: 'geolocation' | 'timeout' | 'network' | 'empty' | null
  refresh: () => void
  requestGeolocation: () => void
}

const RADIUS_DEBOUNCE_MS = 400

function resolveSettingsLocation(): MosqueFinderLocation | null {
  const settingsLocation = useSettingsStore.getState().location
  if (!settingsLocation) return null
  return {
    latitude: settingsLocation.latitude,
    longitude: settingsLocation.longitude,
    label: settingsLocation.city,
    source: 'settings',
  }
}

export function useMosqueFinder(): UseMosqueFinderResult {
  const { t } = useTranslation()
  const settingsLocation = useSettingsStore((s) => s.location)

  const [location, setLocation] = useState<MosqueFinderLocation | null>(null)
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [radiusM, setRadiusMState] = useState<RadiusMeters>(DEFAULT_RADIUS_M)
  const [debouncedRadiusM, setDebouncedRadiusM] = useState<RadiusMeters>(DEFAULT_RADIUS_M)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<UseMosqueFinderResult['errorCode']>(null)

  const abortRef = useRef<AbortController | null>(null)
  const geolocationAttemptedRef = useRef(false)

  const setRadiusM = useCallback((radius: RadiusMeters) => {
    setRadiusMState(radius)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedRadiusM(radiusM)
    }, RADIUS_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [radiusM])

  const loadMosques = useCallback(
    (target: MosqueFinderLocation, skipCache = false) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)
      setErrorCode(null)

      fetchNearbyMosques(
        target.latitude,
        target.longitude,
        debouncedRadiusM,
        { signal: controller.signal, skipCache },
      )
        .then((results) => {
          if (controller.signal.aborted) return
          setMosques(results)
          if (results.length === 0) {
            setError(t('pages.mosqueFinder.noResults'))
            setErrorCode('empty')
          }
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          if (err instanceof OverpassError) {
            setError(
              err.code === 'timeout'
                ? t('pages.mosqueFinder.timeoutError')
                : err.message,
            )
            setErrorCode(err.code === 'timeout' ? 'timeout' : 'network')
          } else {
            setError(t('pages.mosqueFinder.networkError'))
            setErrorCode('network')
          }
          setMosques([])
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        })
    },
    [debouncedRadiusM, t],
  )

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      const fallback = resolveSettingsLocation()
      if (fallback) {
        setLocation(fallback)
        return
      }
      setError(t('pages.mosqueFinder.geolocationDenied'))
      setErrorCode('geolocation')
      return
    }

    setLocating(true)
    setError(null)
    setErrorCode(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: 'geolocation',
        })
        setLocating(false)
      },
      () => {
        const fallback = resolveSettingsLocation()
        if (fallback) {
          setLocation(fallback)
        } else {
          setError(t('pages.mosqueFinder.geolocationDenied'))
          setErrorCode('geolocation')
        }
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 },
    )
  }, [t])

  useEffect(() => {
    if (geolocationAttemptedRef.current) return
    geolocationAttemptedRef.current = true
    requestGeolocation()
  }, [requestGeolocation])

  useEffect(() => {
    if (!location && settingsLocation) {
      setLocation({
        latitude: settingsLocation.latitude,
        longitude: settingsLocation.longitude,
        label: settingsLocation.city,
        source: 'settings',
      })
    }
  }, [location, settingsLocation])

  useEffect(() => {
    if (!location) return
    loadMosques(location)
    return () => abortRef.current?.abort()
  }, [location, debouncedRadiusM, loadMosques])

  const refresh = useCallback(() => {
    if (!location) {
      requestGeolocation()
      return
    }
    loadMosques(location, true)
  }, [location, loadMosques, requestGeolocation])

  return {
    mosques,
    location,
    radiusM,
    setRadiusM,
    loading,
    locating,
    error,
    errorCode,
    refresh,
    requestGeolocation,
  }
}
