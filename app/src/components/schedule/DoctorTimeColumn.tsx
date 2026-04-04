import { useMemo, useState, useCallback } from 'react'
import {
  TOTAL_HEIGHT_PX,
  SLOT_HEIGHT_PX,
  DAY_START_HOUR,
  DAY_END_HOUR,
  SLOT_MINUTES,
  timeToY,
  durationToHeight,
  hhmmToY,
  yToTime,
  buildLocalIso,
} from '@/lib/timeGrid'
import AppointmentBlock from './AppointmentBlock'
import type { Availability, TimeOff, AppointmentStatus } from '@/lib/database.types'

export interface ColumnAppointment {
  id: string
  patient: { id: string; full_name: string } | null
  status: AppointmentStatus
  start_time: string
  end_time: string
  notes: string | null
}

interface DoctorTimeColumnProps {
  doctorId: string
  appointments: ColumnAppointment[]
  availability: Availability[]
  timeOff: TimeOff[]
  selectedDate: string
  canManage: boolean
  onAppointmentClick: (id: string) => void
  onSlotClick: (doctorId: string, startIso: string, endIso: string) => void
}

const totalSlots = (DAY_END_HOUR - DAY_START_HOUR) * 2 // 24 half-hour slots

const timeOffColors: Record<string, string> = {
  vacation: 'bg-purple-100/60 border-purple-300',
  sick: 'bg-red-100/60 border-red-300',
  blocked: 'bg-gray-200/60 border-gray-400',
}

export default function DoctorTimeColumn({
  doctorId,
  appointments,
  availability,
  timeOff,
  selectedDate,
  canManage,
  onAppointmentClick,
  onSlotClick,
}: DoctorTimeColumnProps) {
  const [hoverSlotIndex, setHoverSlotIndex] = useState<number | null>(null)

  // Pre-compute appointment positions
  const positioned = useMemo(
    () =>
      appointments.map((apt) => ({
        ...apt,
        top: timeToY(apt.start_time),
        height: durationToHeight(apt.start_time, apt.end_time),
      })),
    [appointments],
  )

  // Build a set of slot indices that are available (inside availability, outside appointments & time-off)
  const availableSlotIndices = useMemo(() => {
    const set = new Set<number>()
    if (!canManage) return set

    for (let i = 0; i < totalSlots; i++) {
      const slotStartMin = (DAY_START_HOUR * 60) + i * SLOT_MINUTES
      const slotEndMin = slotStartMin + SLOT_MINUTES

      // Must be inside at least one availability window
      const inAvailability = availability.some((a) => {
        const [ah, am] = a.start_time.split(':').map(Number)
        const [eh, em] = a.end_time.split(':').map(Number)
        return slotStartMin >= ah! * 60 + am! && slotEndMin <= eh! * 60 + em!
      })
      if (!inAvailability) continue

      // Must not overlap any appointment
      const overlapsAppointment = appointments.some((apt) => {
        if (apt.status === 'cancelled') return false
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time)
        const aptStartMin = aptStart.getHours() * 60 + aptStart.getMinutes()
        const aptEndMin = aptEnd.getHours() * 60 + aptEnd.getMinutes()
        return slotStartMin < aptEndMin && slotEndMin > aptStartMin
      })
      if (overlapsAppointment) continue

      // Must not overlap time-off
      const overlapsTimeOff = timeOff.some((entry) => {
        const toStart = new Date(entry.start_datetime)
        const toEnd = new Date(entry.end_datetime)
        const toStartMin = toStart.getHours() * 60 + toStart.getMinutes()
        const toEndMin = toEnd.getHours() * 60 + toEnd.getMinutes()
        return slotStartMin < toEndMin && slotEndMin > toStartMin
      })
      if (overlapsTimeOff) continue

      set.add(i)
    }
    return set
  }, [canManage, availability, appointments, timeOff])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canManage) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top + e.currentTarget.scrollTop
    const slotIndex = Math.floor(relativeY / SLOT_HEIGHT_PX)
    if (slotIndex >= 0 && slotIndex < totalSlots && availableSlotIndices.has(slotIndex)) {
      setHoverSlotIndex(slotIndex)
    } else {
      setHoverSlotIndex(null)
    }
  }, [canManage, availableSlotIndices])

  const handleMouseLeave = useCallback(() => {
    setHoverSlotIndex(null)
  }, [])

  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!canManage) return
    // Don't trigger if clicking on an appointment block
    if ((e.target as HTMLElement).closest('button')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top + e.currentTarget.scrollTop
    const { hours, minutes } = yToTime(relativeY)

    // Only allow click on available slots
    const slotIndex = Math.floor(relativeY / SLOT_HEIGHT_PX)
    if (!availableSlotIndices.has(slotIndex)) return

    // Build 30-min slot
    const endMins = minutes + 30
    const endH = hours + Math.floor(endMins / 60)
    const endM = endMins % 60

    const startIso = buildLocalIso(selectedDate, hours, minutes)
    const endIso = buildLocalIso(selectedDate, endH, endM)
    onSlotClick(doctorId, startIso, endIso)
  }

  return (
    <div
      className={`relative min-w-[220px] flex-1 border-r bg-muted/20 last:border-r-0${canManage ? ' cursor-pointer' : ''}`}
      style={{ height: TOTAL_HEIGHT_PX }}
      onClick={handleColumnClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Grid lines (30-min) */}
      {Array.from({ length: totalSlots }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-border/20"
          style={{ top: i * SLOT_HEIGHT_PX, height: SLOT_HEIGHT_PX }}
        />
      ))}

      {/* Availability overlay: white blocks on gray background */}
      {availability.map((slot) => {
        const top = hhmmToY(slot.start_time)
        const bottom = hhmmToY(slot.end_time)
        return (
          <div
            key={slot.id}
            className="absolute left-0 right-0 bg-white/80"
            style={{ top, height: bottom - top }}
          />
        )
      })}

      {/* Time-off blocks */}
      {timeOff.map((entry) => {
        const top = timeToY(entry.start_datetime)
        const bottom = timeToY(entry.end_datetime)
        return (
          <div
            key={entry.id}
            className={`absolute left-0 right-0 z-[2] border-l-2 ${timeOffColors[entry.type] ?? 'bg-gray-200/60 border-gray-400'}`}
            style={{ top, height: Math.max(bottom - top, 4) }}
          >
            <span className="px-1 text-[10px] font-medium text-muted-foreground">
              {entry.type}
            </span>
          </div>
        )
      })}

      {/* Hover highlight */}
      {hoverSlotIndex !== null && (
        <div
          className="pointer-events-none absolute left-1 right-1 z-[1] rounded-md border-2 border-primary/40 bg-primary/10 transition-all duration-75"
          style={{ top: hoverSlotIndex * SLOT_HEIGHT_PX + 1, height: SLOT_HEIGHT_PX - 2 }}
        />
      )}

      {/* Appointment blocks */}
      {positioned.map((apt) => (
        <AppointmentBlock
          key={apt.id}
          patientName={apt.patient?.full_name ?? 'Unknown'}
          status={apt.status}
          startTime={apt.start_time}
          endTime={apt.end_time}
          notes={apt.notes}
          top={apt.top}
          height={apt.height}
          onClick={() => onAppointmentClick(apt.id)}
        />
      ))}

    </div>
  )
}
