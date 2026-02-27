// Time-grid calendar constants and pure utility functions

export const DAY_START_HOUR = 8
export const DAY_END_HOUR = 20
export const SLOT_MINUTES = 30
export const SLOT_HEIGHT_PX = 60 // pixels per 30-min slot
export const PX_PER_MINUTE = SLOT_HEIGHT_PX / SLOT_MINUTES // 2
export const TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60 // 720
export const TOTAL_HEIGHT_PX = TOTAL_MINUTES * PX_PER_MINUTE // 1440
export const TIME_AXIS_WIDTH = 64 // px

/** Convert an ISO timestamp to Y offset (px) from the top of the grid */
export function timeToY(isoTime: string): number {
  const d = new Date(isoTime)
  const mins = d.getHours() * 60 + d.getMinutes() - DAY_START_HOUR * 60
  return Math.max(0, Math.min(mins * PX_PER_MINUTE, TOTAL_HEIGHT_PX))
}

/** Convert Y offset (px) to { hours, minutes } snapped to SLOT_MINUTES */
export function yToTime(y: number): { hours: number; minutes: number } {
  const totalMins = Math.round(y / PX_PER_MINUTE) + DAY_START_HOUR * 60
  const snapped = Math.floor(totalMins / SLOT_MINUTES) * SLOT_MINUTES
  return { hours: Math.floor(snapped / 60), minutes: snapped % 60 }
}

/** Height in px for an appointment block */
export function durationToHeight(startIso: string, endIso: string): number {
  const dur = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000
  return Math.max(dur * PX_PER_MINUTE, SLOT_HEIGHT_PX / 2) // min 30px
}

/** Y offset of the current time indicator */
export function currentTimeY(): number {
  const now = new Date()
  return (now.getHours() * 60 + now.getMinutes() - DAY_START_HOUR * 60) * PX_PER_MINUTE
}

/** Convert "HH:MM" availability string to Y offset */
export function hhmmToY(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return Math.max(0, ((h ?? 0) * 60 + (m ?? 0) - DAY_START_HOUR * 60) * PX_PER_MINUTE)
}

/** Generate 30-min slot labels for the time axis */
export function generateTimeSlots(): { label: string; y: number }[] {
  const slots: { label: string; y: number }[] = []
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    for (const m of [0, SLOT_MINUTES]) {
      const mins = (h - DAY_START_HOUR) * 60 + m
      slots.push({
        label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        y: mins * PX_PER_MINUTE,
      })
    }
  }
  return slots
}

/** Build ISO datetime-local string for a given date + hours/minutes */
export function buildLocalIso(date: string, hours: number, minutes: number): string {
  return `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Format date as YYYY-MM-DD */
export function formatDateIso(d: Date): string {
  return d.toISOString().split('T')[0]!
}
