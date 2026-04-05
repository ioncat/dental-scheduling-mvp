import { describe, it, expect } from 'vitest'
import { computeFreeSlots } from './slotUtils'
import type { Availability, TimeOff } from './database.types'

const DATE = '2026-04-06' // Monday (weekday=1)

function makeAvailability(weekday: number, start: string, end: string): Availability {
  return {
    id: crypto.randomUUID(),
    staff_id: 'doc-1',
    weekday,
    start_time: start,
    end_time: end,
    created_at: '',
  }
}

function makeTimeOff(start: string, end: string): TimeOff {
  return {
    id: crypto.randomUUID(),
    staff_id: 'doc-1',
    start_datetime: start,
    end_datetime: end,
    type: 'vacation',
    created_at: '',
  }
}

describe('computeFreeSlots', () => {
  it('returns empty when no availability for the weekday', () => {
    const avail = [makeAvailability(2, '09:00', '17:00')] // Tuesday, but date is Monday
    const slots = computeFreeSlots(DATE, avail, [], [])
    expect(slots).toEqual([])
  })

  it('returns slots within availability window', () => {
    const avail = [makeAvailability(1, '09:00', '12:00')]
    const slots = computeFreeSlots(DATE, avail, [], [])

    // 09:00–12:00 = 3 hours
    // 60-min appointments at 30-min steps: 09:00, 09:30, 10:00, 10:30, 11:00
    expect(slots.length).toBe(5)
    expect(slots[0]!.label).toBe('09:00')
    expect(slots[4]!.label).toBe('11:00')
  })

  it('excludes slots that overlap with existing appointments', () => {
    const avail = [makeAvailability(1, '09:00', '12:00')]
    const appointments = [
      { start_time: '2026-04-06T10:00:00', end_time: '2026-04-06T11:00:00', status: 'scheduled' },
    ]
    const slots = computeFreeSlots(DATE, avail, [], appointments)

    // Slots overlapping 10:00–11:00 are excluded: 09:30, 10:00, 10:30
    const labels = slots.map((s) => s.label)
    expect(labels).not.toContain('10:00')
    expect(labels).toContain('09:00')
    expect(labels).toContain('11:00')
  })

  it('ignores cancelled appointments', () => {
    const avail = [makeAvailability(1, '09:00', '12:00')]
    const appointments = [
      { start_time: '2026-04-06T10:00:00', end_time: '2026-04-06T11:00:00', status: 'cancelled' },
    ]
    const slots = computeFreeSlots(DATE, avail, [], appointments)
    const labels = slots.map((s) => s.label)
    expect(labels).toContain('10:00')
  })

  it('excludes slots that overlap with time off', () => {
    const avail = [makeAvailability(1, '09:00', '17:00')]
    const timeOff = [makeTimeOff('2026-04-06T12:00:00', '2026-04-06T14:00:00')]
    const slots = computeFreeSlots(DATE, avail, timeOff, [])
    const labels = slots.map((s) => s.label)

    expect(labels).not.toContain('12:00')
    expect(labels).not.toContain('13:00')
    expect(labels).toContain('09:00')
    expect(labels).toContain('14:00')
  })

  it('handles full-day time off', () => {
    const avail = [makeAvailability(1, '09:00', '17:00')]
    const timeOff = [makeTimeOff('2026-04-06T00:00:00', '2026-04-07T00:00:00')]
    const slots = computeFreeSlots(DATE, avail, timeOff, [])
    expect(slots).toEqual([])
  })

  it('generates correct ISO strings', () => {
    const avail = [makeAvailability(1, '09:00', '10:30')]
    const slots = computeFreeSlots(DATE, avail, [], [])

    expect(slots[0]!.startIso).toBe('2026-04-06T09:00')
    expect(slots[0]!.endIso).toBe('2026-04-06T10:00')
  })
})
