import { useQuery } from '@tanstack/react-query'
import { listAppointments } from '../repositories/appointments.repo'
import CreateAppointment from '../components/CreateAppointment'

export default function SchedulePage() {
  const { data } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await listAppointments()
      return res.data
    },
  })

  return (
    <div style={{ padding: 40 }}>
      <h2>Schedule</h2>

      <CreateAppointment />

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}