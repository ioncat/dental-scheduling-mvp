import { useRef, useEffect, useState } from 'react'
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
  const [scrollbarWidth, setScrollbarWidth] = useState(0)
  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  // Measure scrollbar width once body mounts
  useEffect(() => {
    if (scrollRef.current) {
      const w = scrollRef.current.offsetWidth - scrollRef.current.clientWidth
      setScrollbarWidth(w > 0 ? w + 1 : 0)
    }
  }, [columns])

  // Scroll to current time on mount / date change
  useEffect(() => {
    if (scrollRef.current) {
      if (isToday) {
        const y = currentTimeY()
        scrollRef.current.scrollTo({ top: Math.max(0, y - 200), behavior: 'smooth' })
      } else {
        // Show from the start of the working day (08:00)
        scrollRef.current.scrollTo({ top: 0 })
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
    <div className="overflow-x-auto rounded-lg border bg-card"
      style={{ '--scrollbar-w': `${scrollbarWidth}px` } as React.CSSProperties}>
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
