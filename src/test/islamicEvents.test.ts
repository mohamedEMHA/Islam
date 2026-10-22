import { describe, expect, it } from 'vitest'
import { ISLAMIC_EVENTS, pickNextEvent } from '@/lib/utils/islamicEvents'

describe('pickNextEvent', () => {
  it('picks the soonest upcoming event from DD-MM-YYYY strings', () => {
    const ramadan = ISLAMIC_EVENTS.find((e) => e.id === 'ramadan_start')
    const eidFitr = ISLAMIC_EVENTS.find((e) => e.id === 'eid_al_fitr')
    expect(ramadan).toBeDefined()
    expect(eidFitr).toBeDefined()

    const resolved = [
      { event: ramadan!, gregorian: '27-09-2026' },
      { event: eidFitr!, gregorian: '15-10-2026' },
    ]

    const now = new Date(2026, 8, 1)
    const next = pickNextEvent(resolved, now)

    expect(next).not.toBeNull()
    expect(next?.event.id).toBe('ramadan_start')
    expect(next?.daysUntil).toBe(26)
    expect(next?.gregorianDate.getFullYear()).toBe(2026)
    expect(next?.gregorianDate.getMonth()).toBe(8)
    expect(next?.gregorianDate.getDate()).toBe(27)
  })

  it('ignores past dates', () => {
    const ramadan = ISLAMIC_EVENTS.find((e) => e.id === 'ramadan_start')
    const eidFitr = ISLAMIC_EVENTS.find((e) => e.id === 'eid_al_fitr')
    const resolved = [
      { event: ramadan!, gregorian: '01-01-2020' },
      { event: eidFitr!, gregorian: '27-09-2026' },
    ]

    const next = pickNextEvent(resolved, new Date(2026, 8, 1))
    expect(next?.event.id).toBe('eid_al_fitr')
  })

  it('returns null when every date is in the past', () => {
    const resolved = ISLAMIC_EVENTS.map((event) => ({
      event,
      gregorian: '01-01-2020',
    }))
    expect(pickNextEvent(resolved, new Date(2026, 8, 1))).toBeNull()
  })
})
