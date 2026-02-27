import { TOTAL_HEIGHT_PX } from '@/lib/timeGrid'
import { AppointmentCard } from './AppointmentCard'
import type { ColumnAppointment } from './DoctorTimeColumn'

interface UnassignedSidebarProps {
  appointments: ColumnAppointment[]
  onAppointmentClick: (id: string) => void
}

export default function UnassignedSidebar({ appointments, onAppointmentClick }: UnassignedSidebarProps) {
  if (appointments.length === 0) return null

  return (
    <div
      className="min-w-[200px] overflow-y-auto border-r bg-orange-50/30 p-2"
      style={{ height: TOTAL_HEIGHT_PX }}
    >
      <div className="flex flex-col gap-2">
        {appointments.map((apt) => (
          <AppointmentCard
            key={apt.id}
            id={apt.id}
            patientName={apt.patient?.full_name ?? 'Unknown'}
            status={apt.status}
            startTime={apt.start_time}
            endTime={apt.end_time}
            notes={apt.notes}
            onClick={() => onAppointmentClick(apt.id)}
          />
        ))}
      </div>
    </div>
  )
}
