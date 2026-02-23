import { useQuery } from '@tanstack/react-query'
import { listAppointments } from '@/repositories/appointments.repo'

export default function SchedulePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await listAppointments()
      return res.data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Schedule</h1>
      {isLoading ? (
        <p className="mt-4 text-muted-foreground">Loading appointments...</p>
      ) : (
        <pre className="mt-4 rounded-md bg-muted p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
