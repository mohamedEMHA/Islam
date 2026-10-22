import { haversineDistanceMeters } from '@/lib/utils/haversine'

/** Kaaba coordinates (Masjid al-Haram), WGS84. */
export const KAABA_LATITUDE = 21.4225
export const KAABA_LONGITUDE = 39.8262

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

/** Great-circle initial bearing from a point to the Kaaba (degrees clockwise from true north). */
export function calculateQiblaBearing(lat: number, lng: number): number {
  const φ1 = toRadians(lat)
  const φ2 = toRadians(KAABA_LATITUDE)
  const Δλ = toRadians(KAABA_LONGITUDE - lng)

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)

  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI)
}

export function calculateDistanceToKaaba(lat: number, lng: number): number {
  const meters = haversineDistanceMeters(lat, lng, KAABA_LATITUDE, KAABA_LONGITUDE)
  return Math.round(meters / 1000)
}

type OrientationLike = {
  absolute?: boolean
  alpha: number | null
  webkitCompassHeading?: number
}

/**
 * Compass heading in degrees clockwise from north.
 * Prefers iOS webkitCompassHeading, then absolute alpha (converted from CCW).
 */
export function getCompassHeading(event: OrientationLike): number | null {
  if (typeof event.webkitCompassHeading === 'number' && !Number.isNaN(event.webkitCompassHeading)) {
    return normalizeDegrees(event.webkitCompassHeading)
  }

  if (event.absolute === true && event.alpha !== null && !Number.isNaN(event.alpha)) {
    return normalizeDegrees(360 - event.alpha)
  }

  return null
}
