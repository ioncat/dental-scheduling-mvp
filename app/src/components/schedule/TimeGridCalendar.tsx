import { useRef, useEffect } from 'react'
import { currentTimeY } from '@/lib/timeGrid'
import TimeGridHeader from './TimeGridHeader'
import TimeGridBody from './TimeGridBody'
import type { DoctorColumnData } from './TimeGridBody'
import type { ColumnAppointment } from './DoctorTimeColumn'

interface TimeGridCalendarProps {
  columns: DoctorColumnData[]
  unassigned: ColumnAppointment[]
  selectedDate: string
  canManage: boolean
  onAppointmentClick: (id: string) => void
  onSlotClick: (doctorId: string, startIso: string, endIso: string) => void
}

export default function TimeGridCalendar({
  columns,
  unassigned,
  selectedDate,
  canManage,
  onAppointmentClick,
  onSlotClick,
}: TimeGridCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  // Scroll to current time on mount / date change
  useEffect(() => {
    if (scrollRef.current) {
      if (isToday) {
        const y = currentTimeY()
        scrollRef.current.scrollTo({ top: Math.max(0, y - 200), behavior: 'smooth' })
      } else {
        // Scroll to start of typical working hours (10:00 area)
        scrollRef.current.scrollTo({ top: 240, behavior: 'smooth' })
      }
    }
  }, [selectedDate, isToday])

  const hasUnassigned = canManage && unassigned.length > 0
  const doctorHeaders = columns.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.appointments.length,
  }))

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <TimeGridHeader
        doctors={doctorHeaders}
        hasUnassigned={hasUnassigned}
        unassignedCount={unassigned.length}
      />
      <TimeGridBody
        ref={scrollRef}
        columns={columns}
        unassigned={unassigned}
        selectedDate={selectedDate}
        canManage={canManage}
        isToday={isToday}
        onAppointmentClick={onAppointmentClick}
        onSlotClick={onSlotClick}
      />
    </div>
  )
}
