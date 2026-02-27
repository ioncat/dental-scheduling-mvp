import { forwardRef } from 'react'
import { TOTAL_HEIGHT_PX } from '@/lib/timeGrid'
import TimeAxis from './TimeAxis'
import DoctorTimeColumn from './DoctorTimeColumn'
import UnassignedSidebar from './UnassignedSidebar'
import CurrentTimeIndicator from './CurrentTimeIndicator'
import type { ColumnAppointment } from './DoctorTimeColumn'
import type { Availability, TimeOff } from '@/lib/database.types'

export interface DoctorColumnData {
  id: string
  name: string
  appointments: ColumnAppointment[]
  availability: Availability[]
  timeOff: TimeOff[]
}

interface TimeGridBodyProps {
  columns: DoctorColumnData[]
  unassigned: ColumnAppointment[]
  selectedDate: string
  canManage: boolean
  isToday: boolean
  onAppointmentClick: (id: string) => void
  onSlotClick: (doctorId: string, startIso: string, endIso: string) => void
}

const TimeGridBody = forwardRef<HTMLDivElement, TimeGridBodyProps>(
  ({ columns, unassigned, selectedDate, canManage, isToday, onAppointmentClick, onSlotClick }, ref) => {
    return (
      <div ref={ref} className="relative overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="relative flex" style={{ minHeight: TOTAL_HEIGHT_PX }}>
          {/* Time axis (sticky left) */}
          <div className="sticky left-0 z-10">
            <TimeAxis />
          </div>

          {/* Unassigned sidebar */}
          {canManage && unassigned.length > 0 && (
            <UnassignedSidebar
              appointments={unassigned}
              onAppointmentClick={onAppointmentClick}
            />
          )}

          {/* Doctor columns */}
          {columns.map((col) => (
            <DoctorTimeColumn
              key={col.id}
              doctorId={col.id}
              appointments={col.appointments}
              availability={col.availability}
              timeOff={col.timeOff}
              selectedDate={selectedDate}
              canManage={canManage}
              onAppointmentClick={onAppointmentClick}
              onSlotClick={onSlotClick}
            />
          ))}

          {/* Current time indicator */}
          <CurrentTimeIndicator isToday={isToday} />
        </div>
      </div>
    )
  },
)

TimeGridBody.displayName = 'TimeGridBody'
export default TimeGridBody
