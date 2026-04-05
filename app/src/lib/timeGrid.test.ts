import { describe, it, expect } from 'vitest'
import {
  DAY_START_HOUR,
  DAY_END_HOUR,
  PX_PER_MINUTE,
  TOTAL_HEIGHT_PX,
  timeToY,
  yToTime,
  durationToHeight,
  hhmmToY,
  generateTimeSlots,
  buildLocalIso,
  formatDateIso,
} from './timeGrid'

describe('timeGrid constants', () => {
  it('calculates derived values correctly', () => {
    expect(PX_PER_MINUTE).toBe(2)
    expect(TOTAL_HEIGHT_PX).toBe((DAY_END_HOUR - DAY_START_HOUR) * 60 * PX_PER_MINUTE)
  })
})

describe('timeToY', () => {
  it('returns 0 for DAY_START_HOUR', () => {
    expect(timeToY('2026-04-05T08:00:00')).toBe(0)
  })

  it('returns correct offset for midday', () => {
    // 12:00 = 4 hours after 08:00 = 240 min * 2 px/min = 480
    expect(timeToY('2026-04-05T12:00:00')).toBe(480)
  })

  it('clamps before DAY_START to 0', () => {
    expect(timeToY('2026-04-05T06:00:00')).toBe(0)
  })

  it('clamps after DAY_END to TOTAL_HEIGHT_PX', () => {
    expect(timeToY('2026-04-05T22:00:00')).toBe(TOTAL_HEIGHT_PX)
  })
})

describe('yToTime', () => {
  it('converts y=0 to DAY_START_HOUR:00', () => {
    expect(yToTime(0)).toEqual({ hours: DAY_START_HOUR, minutes: 0 })
  })

  it('snaps to 30-min slots', () => {
    // y=100 → 50 min + 480 min = 530 min → snapped to 510 (8h30) = {8,30}
    const result = yToTime(100)
    expect(result.minutes % 30).toBe(0)
  })
})

describe('durationToHeight', () => {
  it('returns correct height for 1-hour appointment', () => {
    expect(durationToHeight('2026-04-05T09:00:00', '2026-04-05T10:00:00')).toBe(120)
  })

  it('has minimum height of 30px', () => {
    expect(durationToHeight('2026-04-05T09:00:00', '2026-04-05T09:10:00')).toBeGreaterThanOrEqual(30)
  })
})

describe('hhmmToY', () => {
  it('converts 08:00 to 0', () => {
    expect(hhmmToY('08:00')).toBe(0)
  })

  it('converts 10:00 to correct offset', () => {
    expect(hhmmToY('10:00')).toBe(240) // 2h * 60min * 2px
  })
})

describe('generateTimeSlots', () => {
  it('generates slots from DAY_START to DAY_END', () => {
    const slots = generateTimeSlots()
    expect(slots[0]!.label).toBe('08:00')
    expect(slots[slots.length - 1]!.label).toBe('19:30')
  })

  it('generates correct number of 30-min slots', () => {
    const slots = generateTimeSlots()
    expect(slots.length).toBe((DAY_END_HOUR - DAY_START_HOUR) * 2)
  })
})

describe('buildLocalIso', () => {
  it('builds datetime-local string', () => {
    expect(buildLocalIso('2026-04-05', 9, 30)).toBe('2026-04-05T09:30')
  })

  it('pads single-digit hours and minutes', () => {
    expect(buildLocalIso('2026-04-05', 8, 0)).toBe('2026-04-05T08:00')
  })
})

describe('formatDateIso', () => {
  it('formats date as YYYY-MM-DD', () => {
    const d = new Date('2026-04-05T12:00:00')
    expect(formatDateIso(d)).toBe('2026-04-05')
  })
})
