import { AppointmentCard } from './AppointmentCard'

interface AppointmentData {
  id: string
  patient: { id: string; full_name: string } | null
  status: 'scheduled' | 'unassigned' | 'completed' | 'cancelled'
  start_time: string
  end_time: string
  notes: string | null
}

interface DoctorColumnProps {
  doctorName: string
  appointments: AppointmentData[]
  onAppointmentClick: (id: string) => void
}

export function DoctorColumn({ doctorName, appointments, onAppointmentClick }: DoctorColumnProps) {
  return (
    <div className="min-w-[240px] flex-1">
      <div className="sticky top-0 z-10 border-b bg-card px-3 py-2">
        <h3 className="text-sm font-semibold">{doctorName}</h3>
        <span className="text-xs text-muted-foreground">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No appointments</p>
        ) : (
          appointments.map((apt) => (
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
          ))
        )}
      </div>
    </div>
  )
}
