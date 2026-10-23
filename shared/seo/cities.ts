/** Major cities for programmatic prayer / qibla / Ramadan pages. Expand as needed. */

export interface SeoCity {
  /** URL slug, lowercase, underscores only */
  slug: string
  nameEn: string
  country: string
  lat: number
  lng: number
  timezone: string
}

export const SEO_CITIES: readonly SeoCity[] = [
  { slug: 'mecca', nameEn: 'Mecca', country: 'SA', lat: 21.3891, lng: 39.8579, timezone: 'Asia/Riyadh' },
  { slug: 'medina', nameEn: 'Medina', country: 'SA', lat: 24.5247, lng: 39.5692, timezone: 'Asia/Riyadh' },
  { slug: 'riyadh', nameEn: 'Riyadh', country: 'SA', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh' },
  { slug: 'jeddah', nameEn: 'Jeddah', country: 'SA', lat: 21.4858, lng: 39.1925, timezone: 'Asia/Riyadh' },
  { slug: 'dubai', nameEn: 'Dubai', country: 'AE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  { slug: 'abu_dhabi', nameEn: 'Abu Dhabi', country: 'AE', lat: 24.4539, lng: 54.3773, timezone: 'Asia/Dubai' },
  { slug: 'doha', nameEn: 'Doha', country: 'QA', lat: 25.2854, lng: 51.531, timezone: 'Asia/Qatar' },
  { slug: 'kuwait_city', nameEn: 'Kuwait City', country: 'KW', lat: 29.3759, lng: 47.9774, timezone: 'Asia/Kuwait' },
  { slug: 'manama', nameEn: 'Manama', country: 'BH', lat: 26.2285, lng: 50.586, timezone: 'Asia/Bahrain' },
  { slug: 'muscat', nameEn: 'Muscat', country: 'OM', lat: 23.588, lng: 58.3829, timezone: 'Asia/Muscat' },
  { slug: 'cairo', nameEn: 'Cairo', country: 'EG', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
  { slug: 'alexandria', nameEn: 'Alexandria', country: 'EG', lat: 31.2001, lng: 29.9187, timezone: 'Africa/Cairo' },
  { slug: 'istanbul', nameEn: 'Istanbul', country: 'TR', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
  { slug: 'ankara', nameEn: 'Ankara', country: 'TR', lat: 39.9334, lng: 32.8597, timezone: 'Europe/Istanbul' },
  { slug: 'jakarta', nameEn: 'Jakarta', country: 'ID', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
  { slug: 'surabaya', nameEn: 'Surabaya', country: 'ID', lat: -7.2575, lng: 112.7521, timezone: 'Asia/Jakarta' },
  { slug: 'bandung', nameEn: 'Bandung', country: 'ID', lat: -6.9175, lng: 107.6191, timezone: 'Asia/Jakarta' },
  { slug: 'medan', nameEn: 'Medan', country: 'ID', lat: 3.5952, lng: 98.6722, timezone: 'Asia/Jakarta' },
  { slug: 'kuala_lumpur', nameEn: 'Kuala Lumpur', country: 'MY', lat: 3.139, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { slug: 'singapore', nameEn: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
  { slug: 'karachi', nameEn: 'Karachi', country: 'PK', lat: 24.8607, lng: 67.0011, timezone: 'Asia/Karachi' },
  { slug: 'lahore', nameEn: 'Lahore', country: 'PK', lat: 31.5204, lng: 74.3587, timezone: 'Asia/Karachi' },
  { slug: 'islamabad', nameEn: 'Islamabad', country: 'PK', lat: 33.6844, lng: 73.0479, timezone: 'Asia/Karachi' },
  { slug: 'dhaka', nameEn: 'Dhaka', country: 'BD', lat: 23.8103, lng: 90.4125, timezone: 'Asia/Dhaka' },
  { slug: 'delhi', nameEn: 'Delhi', country: 'IN', lat: 28.7041, lng: 77.1025, timezone: 'Asia/Kolkata' },
  { slug: 'mumbai', nameEn: 'Mumbai', country: 'IN', lat: 19.076, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { slug: 'hyderabad_in', nameEn: 'Hyderabad', country: 'IN', lat: 17.385, lng: 78.4867, timezone: 'Asia/Kolkata' },
  { slug: 'london', nameEn: 'London', country: 'GB', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { slug: 'birmingham', nameEn: 'Birmingham', country: 'GB', lat: 52.4862, lng: -1.8904, timezone: 'Europe/London' },
  { slug: 'manchester', nameEn: 'Manchester', country: 'GB', lat: 53.4808, lng: -2.2426, timezone: 'Europe/London' },
  { slug: 'paris', nameEn: 'Paris', country: 'FR', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { slug: 'lyon', nameEn: 'Lyon', country: 'FR', lat: 45.764, lng: 4.8357, timezone: 'Europe/Paris' },
  { slug: 'marseille', nameEn: 'Marseille', country: 'FR', lat: 43.2965, lng: 5.3698, timezone: 'Europe/Paris' },
  { slug: 'brussels', nameEn: 'Brussels', country: 'BE', lat: 50.8503, lng: 4.3517, timezone: 'Europe/Brussels' },
  { slug: 'amsterdam', nameEn: 'Amsterdam', country: 'NL', lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam' },
  { slug: 'berlin', nameEn: 'Berlin', country: 'DE', lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin' },
  { slug: 'frankfurt', nameEn: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821, timezone: 'Europe/Berlin' },
  { slug: 'stockholm', nameEn: 'Stockholm', country: 'SE', lat: 59.3293, lng: 18.0686, timezone: 'Europe/Stockholm' },
  { slug: 'oslo', nameEn: 'Oslo', country: 'NO', lat: 59.9139, lng: 10.7522, timezone: 'Europe/Oslo' },
  { slug: 'copenhagen', nameEn: 'Copenhagen', country: 'DK', lat: 55.6761, lng: 12.5683, timezone: 'Europe/Copenhagen' },
  { slug: 'vienna', nameEn: 'Vienna', country: 'AT', lat: 48.2082, lng: 16.3738, timezone: 'Europe/Vienna' },
  { slug: 'zurich', nameEn: 'Zurich', country: 'CH', lat: 47.3769, lng: 8.5417, timezone: 'Europe/Zurich' },
  { slug: 'madrid', nameEn: 'Madrid', country: 'ES', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid' },
  { slug: 'barcelona', nameEn: 'Barcelona', country: 'ES', lat: 41.3874, lng: 2.1686, timezone: 'Europe/Madrid' },
  { slug: 'rome', nameEn: 'Rome', country: 'IT', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome' },
  { slug: 'milan', nameEn: 'Milan', country: 'IT', lat: 45.4642, lng: 9.19, timezone: 'Europe/Rome' },
  { slug: 'athens', nameEn: 'Athens', country: 'GR', lat: 37.9838, lng: 23.7275, timezone: 'Europe/Athens' },
  { slug: 'moscow', nameEn: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow' },
  { slug: 'kazan', nameEn: 'Kazan', country: 'RU', lat: 55.8304, lng: 49.0661, timezone: 'Europe/Moscow' },
  { slug: 'new_york', nameEn: 'New York', country: 'US', lat: 40.7128, lng: -74.006, timezone: 'America/New_York' },
  { slug: 'chicago', nameEn: 'Chicago', country: 'US', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago' },
  { slug: 'houston', nameEn: 'Houston', country: 'US', lat: 29.7604, lng: -95.3698, timezone: 'America/Chicago' },
  { slug: 'los_angeles', nameEn: 'Los Angeles', country: 'US', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  { slug: 'toronto', nameEn: 'Toronto', country: 'CA', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { slug: 'montreal', nameEn: 'Montreal', country: 'CA', lat: 45.5017, lng: -73.5673, timezone: 'America/Toronto' },
  { slug: 'vancouver', nameEn: 'Vancouver', country: 'CA', lat: 49.2827, lng: -123.1207, timezone: 'America/Vancouver' },
  { slug: 'sydney', nameEn: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  { slug: 'melbourne', nameEn: 'Melbourne', country: 'AU', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne' },
  { slug: 'perth', nameEn: 'Perth', country: 'AU', lat: -31.9505, lng: 115.8605, timezone: 'Australia/Perth' },
  { slug: 'auckland', nameEn: 'Auckland', country: 'NZ', lat: -36.8509, lng: 174.7645, timezone: 'Pacific/Auckland' },
  { slug: 'casablanca', nameEn: 'Casablanca', country: 'MA', lat: 33.5731, lng: -7.5898, timezone: 'Africa/Casablanca' },
  { slug: 'rabat', nameEn: 'Rabat', country: 'MA', lat: 34.0209, lng: -6.8416, timezone: 'Africa/Casablanca' },
  { slug: 'algiers', nameEn: 'Algiers', country: 'DZ', lat: 36.7538, lng: 3.0588, timezone: 'Africa/Algiers' },
  { slug: 'tunis', nameEn: 'Tunis', country: 'TN', lat: 36.8065, lng: 10.1815, timezone: 'Africa/Tunis' },
  { slug: 'tripoli', nameEn: 'Tripoli', country: 'LY', lat: 32.8872, lng: 13.1913, timezone: 'Africa/Tripoli' },
  { slug: 'khartoum', nameEn: 'Khartoum', country: 'SD', lat: 15.5007, lng: 32.5599, timezone: 'Africa/Khartoum' },
  { slug: 'lagos', nameEn: 'Lagos', country: 'NG', lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos' },
  { slug: 'kano', nameEn: 'Kano', country: 'NG', lat: 12.0022, lng: 8.592, timezone: 'Africa/Lagos' },
  { slug: 'nairobi', nameEn: 'Nairobi', country: 'KE', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi' },
  { slug: 'addis_ababa', nameEn: 'Addis Ababa', country: 'ET', lat: 9.032, lng: 38.7469, timezone: 'Africa/Addis_Ababa' },
  { slug: 'johannesburg', nameEn: 'Johannesburg', country: 'ZA', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg' },
  { slug: 'cape_town', nameEn: 'Cape Town', country: 'ZA', lat: -33.9249, lng: 18.4241, timezone: 'Africa/Johannesburg' },
  { slug: 'tehran', nameEn: 'Tehran', country: 'IR', lat: 35.6892, lng: 51.389, timezone: 'Asia/Tehran' },
  { slug: 'baghdad', nameEn: 'Baghdad', country: 'IQ', lat: 33.3152, lng: 44.3661, timezone: 'Asia/Baghdad' },
  { slug: 'basra', nameEn: 'Basra', country: 'IQ', lat: 30.5085, lng: 47.7804, timezone: 'Asia/Baghdad' },
  { slug: 'amman', nameEn: 'Amman', country: 'JO', lat: 31.9454, lng: 35.9284, timezone: 'Asia/Amman' },
  { slug: 'beirut', nameEn: 'Beirut', country: 'LB', lat: 33.8938, lng: 35.5018, timezone: 'Asia/Beirut' },
  { slug: 'damascus', nameEn: 'Damascus', country: 'SY', lat: 33.5138, lng: 36.2765, timezone: 'Asia/Damascus' },
  { slug: 'sanaa', nameEn: 'Sanaa', country: 'YE', lat: 15.3694, lng: 44.191, timezone: 'Asia/Aden' },
  { slug: 'kabul', nameEn: 'Kabul', country: 'AF', lat: 34.5553, lng: 69.2075, timezone: 'Asia/Kabul' },
  { slug: 'tashkent', nameEn: 'Tashkent', country: 'UZ', lat: 41.2995, lng: 69.2401, timezone: 'Asia/Tashkent' },
  { slug: 'almaty', nameEn: 'Almaty', country: 'KZ', lat: 43.222, lng: 76.8512, timezone: 'Asia/Almaty' },
  { slug: 'bishkek', nameEn: 'Bishkek', country: 'KG', lat: 42.8746, lng: 74.5698, timezone: 'Asia/Bishkek' },
  { slug: 'dushanbe', nameEn: 'Dushanbe', country: 'TJ', lat: 38.5598, lng: 68.7738, timezone: 'Asia/Dushanbe' },
  { slug: 'ashgabat', nameEn: 'Ashgabat', country: 'TM', lat: 37.9601, lng: 58.3261, timezone: 'Asia/Ashgabat' },
  { slug: 'baku', nameEn: 'Baku', country: 'AZ', lat: 40.4093, lng: 49.8671, timezone: 'Asia/Baku' },
  { slug: 'tokyo', nameEn: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  { slug: 'seoul', nameEn: 'Seoul', country: 'KR', lat: 37.5665, lng: 126.978, timezone: 'Asia/Seoul' },
  { slug: 'beijing', nameEn: 'Beijing', country: 'CN', lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai' },
  { slug: 'shanghai', nameEn: 'Shanghai', country: 'CN', lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
  { slug: 'hong_kong', nameEn: 'Hong Kong', country: 'HK', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
  { slug: 'bangkok', nameEn: 'Bangkok', country: 'TH', lat: 13.7563, lng: 100.5018, timezone: 'Asia/Bangkok' },
  { slug: 'manila', nameEn: 'Manila', country: 'PH', lat: 14.5995, lng: 120.9842, timezone: 'Asia/Manila' },
  { slug: 'colombo', nameEn: 'Colombo', country: 'LK', lat: 6.9271, lng: 79.8612, timezone: 'Asia/Colombo' },
  { slug: 'male', nameEn: 'Malé', country: 'MV', lat: 4.1755, lng: 73.5093, timezone: 'Indian/Maldives' },
  { slug: 'sao_paulo', nameEn: 'São Paulo', country: 'BR', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo' },
  { slug: 'buenos_aires', nameEn: 'Buenos Aires', country: 'AR', lat: -34.6037, lng: -58.3816, timezone: 'America/Argentina/Buenos_Aires' },
  { slug: 'mexico_city', nameEn: 'Mexico City', country: 'MX', lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City' },
  { slug: 'bogota', nameEn: 'Bogotá', country: 'CO', lat: 4.711, lng: -74.0721, timezone: 'America/Bogota' },
]

const BY_SLUG = new Map(SEO_CITIES.map((c) => [c.slug, c]))

const SLUG_RE = /^[a-z][a-z0-9_]{1,48}$/

export function isCitySlug(value: string): boolean {
  return SLUG_RE.test(value) && BY_SLUG.has(value)
}

export function getCityBySlug(slug: string): SeoCity | undefined {
  return BY_SLUG.get(slug)
}

/** Approximate qibla bearing from city to Kaaba (degrees clockwise from north). */
export function qiblaBearingDegrees(lat: number, lng: number): number {
  const kaabaLat = (21.4225 * Math.PI) / 180
  const kaabaLng = (39.8262 * Math.PI) / 180
  const φ1 = (lat * Math.PI) / 180
  const λ1 = (lng * Math.PI) / 180
  const y = Math.sin(kaabaLng - λ1) * Math.cos(kaabaLat)
  const x =
    Math.cos(φ1) * Math.sin(kaabaLat) -
    Math.sin(φ1) * Math.cos(kaabaLat) * Math.cos(kaabaLng - λ1)
  const θ = Math.atan2(y, x)
  return ((θ * 180) / Math.PI + 360) % 360
}
