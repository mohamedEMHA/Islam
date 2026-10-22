import { useState, useEffect, useCallback, useRef } from 'react'

import { getQiblaDirection } from '@/lib/api/aladhan'
import { useSettingsStore } from '@/lib/stores/settingsStore'
import { calculateQiblaBearing, getCompassHeading } from '@/lib/utils/qibla'

type CompassPermission = 'granted' | 'denied' | 'prompt' | 'unsupported'

interface DeviceOrientationEventWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export function useQibla() {
  const location = useSettingsStore((s) => s.location)
  const [bearing, setBearing] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null)
  const [compassSupported, setCompassSupported] = useState(false)
  const [compassUnavailable, setCompassUnavailable] = useState(false)
  const [permission, setPermission] = useState<CompassPermission>('unsupported')
  const listenerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null)
  const usesAbsoluteRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)

  const applyLocalBearing = useCallback((lat: number, lng: number) => {
    setBearing(calculateQiblaBearing(lat, lng))
  }, [])

  const loadQibla = useCallback(() => {
    abortRef.current?.abort()

    if (!location) {
      setBearing(0)
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)
    applyLocalBearing(location.latitude, location.longitude)

    getQiblaDirection(location.latitude, location.longitude, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setBearing(data.direction)
          setError(null)
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        applyLocalBearing(location.latitude, location.longitude)
        setError(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })
  }, [applyLocalBearing, location])

  useEffect(() => {
    loadQibla()
    return () => abortRef.current?.abort()
  }, [loadQibla])

  const detachCompassListener = useCallback(() => {
    if (!listenerRef.current) return
    const handler = listenerRef.current
    if (usesAbsoluteRef.current) {
      window.removeEventListener('deviceorientationabsolute', handler as EventListener)
    } else {
      window.removeEventListener('deviceorientation', handler)
    }
    listenerRef.current = null
    usesAbsoluteRef.current = false
  }, [])

  const attachCompassListener = useCallback(() => {
    if (listenerRef.current) return

    const preferAbsolute = 'ondeviceorientationabsolute' in window

    const handler = (event: DeviceOrientationEvent) => {
      const heading = getCompassHeading(
        event as DeviceOrientationEvent & { webkitCompassHeading?: number },
      )
      if (heading === null) return
      setDeviceHeading(heading)
      setCompassSupported(true)
      setCompassUnavailable(false)
    }

    listenerRef.current = handler
    usesAbsoluteRef.current = preferAbsolute

    if (preferAbsolute) {
      window.addEventListener('deviceorientationabsolute', handler as EventListener)
    } else {
      window.addEventListener('deviceorientation', handler)
    }
  }, [])

  useEffect(() => {
    if (!('DeviceOrientationEvent' in window)) {
      setPermission('unsupported')
      return
    }

    const orientationEvent = DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission
    if (typeof orientationEvent.requestPermission === 'function') {
      setPermission('prompt')
      return
    }

    setPermission('granted')
    attachCompassListener()
    return detachCompassListener
  }, [attachCompassListener, detachCompassListener])

  useEffect(() => {
    if (permission !== 'granted') {
      setCompassUnavailable(false)
      return
    }
    if (deviceHeading !== null) {
      setCompassUnavailable(false)
      return
    }
    const timerId = window.setTimeout(() => setCompassUnavailable(true), 2000)
    return () => window.clearTimeout(timerId)
  }, [permission, deviceHeading])

  const requestCompassPermission = useCallback(async (): Promise<boolean> => {
    const orientationEvent = DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission
    if (typeof orientationEvent.requestPermission !== 'function') {
      attachCompassListener()
      setPermission('granted')
      return true
    }

    try {
      const result = await orientationEvent.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        attachCompassListener()
        return true
      }
      return false
    } catch {
      setPermission('denied')
      return false
    }
  }, [attachCompassListener])

  const needleRotation =
    deviceHeading !== null ? bearing - deviceHeading : bearing

  return {
    bearing,
    needleRotation,
    compassSupported,
    compassUnavailable,
    location,
    loading,
    error,
    refetch: loadQibla,
    permission,
    needsCompassPermission: permission === 'prompt',
    requestCompassPermission,
  }
}
