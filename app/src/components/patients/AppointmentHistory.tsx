import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppointments } from '@/hooks/useAppointments'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface AppointmentHistoryProps {
  patientId: string
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  unassigned: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export function AppointmentHistory({ patientId }: AppointmentHistoryProps) {
  const { data: appointments, isLoading } = useAppointments({ patientId })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No appointments yet.
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt: any) => {
              const start = new Date(apt.start_time)
              const end = new Date(apt.end_time)
              return (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' — '}
                      {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {apt.doctor?.full_name ?? 'Unassigned'}
                    </div>
                    {apt.notes && (
                      <div className="text-xs text-muted-foreground">{apt.notes}</div>
                    )}
                  </div>
                  <Badge className={statusColors[apt.status] ?? ''} variant="secondary">
                    {apt.status}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
