import { generateTimeSlots, SLOT_HEIGHT_PX, TOTAL_HEIGHT_PX, TIME_AXIS_WIDTH } from '@/lib/timeGrid'

const slots = generateTimeSlots()

export default function TimeAxis() {
  return (
    <div
      className="relative shrink-0 border-r bg-card"
      style={{ width: TIME_AXIS_WIDTH, height: TOTAL_HEIGHT_PX }}
    >
      {slots.map((slot) => (
        <div
          key={slot.label}
          className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground"
          style={{ top: slot.y }}
        >
          {slot.label}
        </div>
      ))}
      {/* Grid lines extend from here visually via border on each slot row */}
      {slots.map((slot) => (
        <div
          key={`line-${slot.label}`}
          className="absolute left-0 right-0 border-t border-border/30"
          style={{ top: slot.y, height: SLOT_HEIGHT_PX }}
        />
      ))}
    </div>
  )
}
