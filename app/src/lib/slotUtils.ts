// Pure slot-generation utilities for the Calendly-style booking flow

import type { Availability, TimeOff } from '@/lib/database.types'
import { buildLocalIso } from '@/lib/timeGrid'

// --- Types ---

export interface TimeSlot {
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  label: string    // "09:00"
  startIso: string // "2026-02-27T09:00" (datetime-local format)
  endIso: string   // "2026-02-27T10:00"
}

// --- Constants ---

export const APPOINTMENT_DURATION_MIN = 60
export const SLOT_STEP_MIN = 30

// --- Helpers ---

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

/** Extract minute-of-day from an ISO datetime, clamped to [0, 1440] */
function isoToMinuteOfDay(iso: string): number {
  const d = new Date(iso)
  return Math.max(0, Math.min(1440, d.getHours() * 60 + d.getMinutes()))
}

// --- Main ---

/**
 * Compute free time slots for a given doctor on a given date.
 *
 * @param dateIso      - "YYYY-MM-DD"
 * @param availability - Doctor's weekly availability records
 * @param timeOff      - Doctor's time-off records
 * @param appointments - Existing appointments for this doctor on this date
 * @returns            Sorted array of available TimeSlot objects
 */
export function computeFreeSlots(
  dateIso: string,
  availability: Availability[],
  timeOff: TimeOff[],
  appointments: { start_time: string; end_time: string; status: string }[],
): TimeSlot[] {
  // 1. Determine weekday (0=Sun..6=Sat) using T12:00:00 to avoid DST edge
  const weekday = new Date(dateIso + 'T12:00:00').getDay()

  // 2. Filter availability windows for this weekday
  const windows = availability.filter((a) => a.weekday === weekday)
  if (windows.length === 0) return []

  // 3. Collect busy intervals (minutes-of-day) from non-cancelled appointments
  const busy: [number, number][] = appointments
    .filter((a) => a.status !== 'cancelled')
    .map((a) => [isoToMinuteOfDay(a.start_time), isoToMinuteOfDay(a.end_time)])

  // 4. Collect time-off intervals that overlap with this date
  const dayStart = new Date(dateIso + 'T00:00:00').getTime()
  const dayEnd = new Date(dateIso + 'T23:59:59').getTime()

  const offIntervals: [number, number][] = timeOff
    .filter((t) => {
      const tStart = new Date(t.start_datetime).getTime()
      const tEnd = new Date(t.end_datetime).getTime()
      return tStart < dayEnd && tEnd > dayStart
    })
    .map((t) => {
      // Clamp to day boundaries
      const tStart = new Date(t.start_datetime)
      const tEnd = new Date(t.end_datetime)
      const startMin =
        tStart.getTime() <= dayStart ? 0 : tStart.getHours() * 60 + tStart.getMinutes()
      const endMin =
        tEnd.getTime() >= dayEnd ? 1440 : tEnd.getHours() * 60 + tEnd.getMinutes()
      return [startMin, endMin] as [number, number]
    })

  // 5. Generate candidate slots within each availability window
  const slots: TimeSlot[] = []

  for (const win of windows) {
    const winStart = toMinutes(win.start_time)
    const winEnd = toMinutes(win.end_time)

    for (let m = winStart; m + APPOINTMENT_DURATION_MIN <= winEnd; m += SLOT_STEP_MIN) {
      const slotStart = m
      const slotEnd = m + APPOINTMENT_DURATION_MIN

      // 6. Check overlap with busy (existing appointments)
      const isBusy = busy.some(([bs, be]) => rangesOverlap(slotStart, slotEnd, bs, be))
      if (isBusy) continue

      // 7. Check overlap with time-off
      const isOff = offIntervals.some(([os, oe]) => rangesOverlap(slotStart, slotEnd, os, oe))
      if (isOff) continue

      // 8. Build the TimeSlot
      const startHour = Math.floor(slotStart / 60)
      const startMinute = slotStart % 60
      const endHour = Math.floor(slotEnd / 60)
      const endMinute = slotEnd % 60

      slots.push({
        startHour,
        startMinute,
        endHour,
        endMinute,
        label: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
        startIso: buildLocalIso(dateIso, startHour, startMinute),
        endIso: buildLocalIso(dateIso, endHour, endMinute),
      })
    }
  }

  return slots
}
