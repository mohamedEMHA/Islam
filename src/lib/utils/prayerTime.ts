/** Strip AlAdhan suffixes like " (EET)" from HH:mm strings. */
export function stripAlAdhanTime(timeStr: string): string {
  return timeStr.trim().split(/\s+/)[0] ?? ''
}

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const map = Object.fromEntries(
    dtf
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  }
}

/** Convert a wall-clock time in `timeZone` to a UTC Date. */
export function zonedWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0)
  for (let i = 0; i < 3; i++) {
    const asZoned = getZonedParts(new Date(utcMs), timeZone)
    const asZonedAsUtc = Date.UTC(
      asZoned.year,
      asZoned.month - 1,
      asZoned.day,
      asZoned.hour,
      asZoned.minute,
      asZoned.second,
    )
    const wantedAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0)
    const diff = wantedAsUtc - asZonedAsUtc
    if (diff === 0) break
    utcMs += diff
  }
  return new Date(utcMs)
}

/** YYYY-MM-DD in the given IANA timezone. */
export function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, timeZone)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

/** Milliseconds until the next local midnight in `timeZone`. */
export function getMsUntilNextMidnight(timeZone: string, now = new Date()): number {
  const parts = getZonedParts(now, timeZone)
  const todayNoon = zonedWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0, timeZone)
  const tomorrowNoon = new Date(todayNoon.getTime() + 86_400_000)
  const tmr = getZonedParts(tomorrowNoon, timeZone)
  const nextMidnight = zonedWallTimeToUtc(tmr.year, tmr.month, tmr.day, 0, 0, timeZone)
  const ms = nextMidnight.getTime() - now.getTime()
  return ms > 0 ? ms : 60_000
}

/**
 * Parse an AlAdhan HH:mm (optional " (TZ)" suffix) as wall time in `timeZone`
 * on the calendar day of `baseDate` in that zone.
 */
export function parseAlAdhanTime(
  timeStr: string,
  timeZone: string,
  baseDate = new Date(),
): Date {
  const cleaned = stripAlAdhanTime(timeStr)
  const [hStr, mStr] = cleaned.split(':')
  const hours = Number(hStr)
  const minutes = Number(mStr)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return new Date(NaN)
  }
  const day = getZonedParts(baseDate, timeZone)
  return zonedWallTimeToUtc(day.year, day.month, day.day, hours, minutes, timeZone)
}

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}
