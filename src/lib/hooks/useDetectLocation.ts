import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { reverseGeocode } from '@/lib/utils/geocode'
import type { LocationCoords } from '@/types/prayer'

export interface DetectLocationResult {
  location: LocationCoords | null
  loading: boolean
  error: string | null
  detectAndSave: () => Promise<LocationCoords | null>
  saveCoords: (latitude: number, longitude: number) => Promise<LocationCoords>
}

export function useDetectLocation(): DetectLocationResult {
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const storedLocation = useSettingsStore((s) => s.location)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestGenerationRef = useRef(0)

  useEffect(() => {
    return () => {
      requestGenerationRef.current += 1
    }
  }, [])

  const saveCoords = useCallback(
    async (
      latitude: number,
      longitude: number,
      operationGeneration?: number,
    ): Promise<LocationCoords> => {
      const generation = operationGeneration ?? ++requestGenerationRef.current
      setLoading(true)
      setError(null)
      try {
        const { city, country } = await reverseGeocode(latitude, longitude)
        if (generation !== requestGenerationRef.current) {
          return { latitude, longitude }
        }
        const location: LocationCoords = {
          latitude,
          longitude,
          city: city || undefined,
          country: country || undefined,
        }
        updateSettings({
          location: {
            latitude,
            longitude,
            city: city || '',
            country: country || '',
          },
          onboardingComplete: true,
        })
        return location
      } catch (err) {
        if (generation !== requestGenerationRef.current) {
          return { latitude, longitude }
        }
        const message = err instanceof Error ? err.message : 'Failed to resolve location'
        setError(message)
        const location: LocationCoords = { latitude, longitude }
        updateSettings({
          location: {
            latitude,
            longitude,
            city: '',
            country: '',
          },
          onboardingComplete: true,
        })
        return location
      } finally {
        if (generation === requestGenerationRef.current) {
          setLoading(false)
        }
      }
    },
    [updateSettings],
  )

  const detectAndSave = useCallback(async (): Promise<LocationCoords | null> => {
    const generation = ++requestGenerationRef.current
    setError(null)
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return null
    }
    setLoading(true)
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (generation !== requestGenerationRef.current) {
            resolve(null)
            return
          }
          try {
            const location = await saveCoords(
              pos.coords.latitude,
              pos.coords.longitude,
              generation,
            )
            if (generation !== requestGenerationRef.current) {
              resolve(null)
              return
            }
            resolve(location)
          } catch {
            resolve(null)
          }
        },
        (err) => {
          if (generation !== requestGenerationRef.current) {
            resolve(null)
            return
          }
          setError(err.message)
          setLoading(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    })
  }, [saveCoords])

  return {
    location: storedLocation,
    loading,
    error,
    detectAndSave,
    saveCoords,
  }
}
