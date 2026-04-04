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

  // Slot status: 'available' | reason string for each 30-min slot
  type SlotStatus = { available: true } | { available: false; reason: string }

  const slotStatuses = useMemo(() => {
    const statuses: SlotStatus[] = []

    for (let i = 0; i < totalSlots; i++) {
      const slotStartMin = (DAY_START_HOUR * 60) + i * SLOT_MINUTES
      const slotEndMin = slotStartMin + SLOT_MINUTES

      if (!canManage) {
        statuses.push({ available: false, reason: 'View only' })
        continue
      }

      // Check availability first
      const inAvailability = availability.some((a) => {
        const [ah, am] = a.start_time.split(':').map(Number)
        const [eh, em] = a.end_time.split(':').map(Number)
        return slotStartMin >= ah! * 60 + am! && slotEndMin <= eh! * 60 + em!
      })
      if (!inAvailability) {
        if (availability.length === 0) {
          statuses.push({ available: false, reason: 'No working hours today' })
        } else {
          const windows = availability.map(a => `${a.start_time.slice(0,5)}–${a.end_time.slice(0,5)}`).join(', ')
          statuses.push({ available: false, reason: `Outside working hours (${windows})` })
        }
        continue
      }

      // Check time-off overlap
      const matchedTimeOff = timeOff.find((entry) => {
        const toStart = new Date(entry.start_datetime)
        const toEnd = new Date(entry.end_datetime)
        const toStartMin = toStart.getHours() * 60 + toStart.getMinutes()
        const toEndMin = toEnd.getHours() * 60 + toEnd.getMinutes()
        return slotStartMin < toEndMin && slotEndMin > toStartMin
      })
      if (matchedTimeOff) {
        const typeLabel = matchedTimeOff.type === 'vacation' ? 'Vacation' : matchedTimeOff.type === 'sick' ? 'Sick leave' : 'Blocked'
        statuses.push({ available: false, reason: typeLabel })
        continue
      }

      // Check appointment overlap
      const matchedApt = appointments.find((apt) => {
        if (apt.status === 'cancelled') return false
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time)
        const aptStartMin = aptStart.getHours() * 60 + aptStart.getMinutes()
        const aptEndMin = aptEnd.getHours() * 60 + aptEnd.getMinutes()
        return slotStartMin < aptEndMin && slotEndMin > aptStartMin
      })
      if (matchedApt) {
        statuses.push({ available: false, reason: `Booked: ${matchedApt.patient?.full_name ?? 'Patient'}` })
        continue
      }

      statuses.push({ available: true })
    }
    return statuses
  }, [canManage, availability, appointments, timeOff])

  // Set of available indices for quick check
  const availableSlotIndices = useMemo(() => {
    const set = new Set<number>()
    slotStatuses.forEach((s, i) => { if (s.available) set.add(i) })
    return set
  }, [slotStatuses])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canManage) return
    // Don't show tooltip when hovering appointment blocks
    if ((e.target as HTMLElement).closest('button')) {
      setHoverSlotIndex(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top + e.currentTarget.scrollTop
    const slotIndex = Math.floor(relativeY / SLOT_HEIGHT_PX)
    if (slotIndex >= 0 && slotIndex < totalSlots) {
      setHoverSlotIndex(slotIndex)
    } else {
      setHoverSlotIndex(null)
    }
  }, [canManage])

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
      className={`relative min-w-[220px] flex-1 border-r bg-muted/20 last:border-r-0${canManage ? ' cursor-crosshair' : ''}`}
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

      {/* Hover highlight + tooltip */}
      {hoverSlotIndex !== null && (() => {
        const status = slotStatuses[hoverSlotIndex]
        const isAvail = status?.available
        const slotMin = DAY_START_HOUR * 60 + hoverSlotIndex * SLOT_MINUTES
        const hh = String(Math.floor(slotMin / 60)).padStart(2, '0')
        const mm = String(slotMin % 60).padStart(2, '0')
        const timeLabel = `${hh}:${mm}`
        return (
          <div
            className="pointer-events-none absolute left-1 right-1 z-[3] transition-all duration-75"
            style={{ top: hoverSlotIndex * SLOT_HEIGHT_PX + 1, height: SLOT_HEIGHT_PX - 2 }}
          >
            {/* Slot highlight */}
            <div className={`h-full w-full rounded-md border-2 ${
              isAvail
                ? 'border-primary/40 bg-primary/10'
                : 'border-muted-foreground/20 bg-muted/30'
            }`} />
            {/* Tooltip */}
            <div className={`absolute left-1/2 -translate-x-1/2 -top-9 z-[4] whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium shadow-md ${
              isAvail
                ? 'bg-primary text-primary-foreground'
                : 'bg-foreground text-background'
            }`}>
              {isAvail ? `${timeLabel} — Click to book` : `${timeLabel} — ${(status as { reason: string }).reason}`}
              {/* Arrow */}
              <div className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-2 w-2 rotate-45 ${
                isAvail ? 'bg-primary' : 'bg-foreground'
              }`} />
            </div>
          </div>
        )
      })()}

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
