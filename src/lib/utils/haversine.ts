const EARTH_RADIUS_M = 6_371_000

/** Great circle distance in meters between two WGS84 coordinates. */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_M * c
}

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface WithDistance extends GeoPoint {
  distanceMeters: number
}

/** Sort items by ascending distance from a reference point. */
export function sortByDistance<T extends GeoPoint>(
  items: T[],
  originLat: number,
  originLng: number,
): Array<T & { distanceMeters: number }> {
  return items
    .map((item) => ({
      ...item,
      distanceMeters: haversineDistanceMeters(
        originLat,
        originLng,
        item.latitude,
        item.longitude,
      ),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
}

/** Human readable distance for mosque finder UI. */
export function formatDistanceMeters(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  const km = meters / 1000
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`
}
