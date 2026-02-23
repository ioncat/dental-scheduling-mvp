import { useState } from 'react'
import { createAppointment } from '../repositories/appointments.repo'
import { useQueryClient } from '@tanstack/react-query'

export default function CreateAppointment() {
  const qc = useQueryClient()
  const [patientId, setPatientId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  async function handleCreate() {
    await createAppointment({
      patient_id: patientId,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      status: 'scheduled',
    })

    qc.invalidateQueries({ queryKey: ['appointments'] })
  }

  return (
    <div>
      <input
        placeholder="patient uuid"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
      />
      <input type="datetime-local" onChange={(e) => setStart(e.target.value)} />
      <input type="datetime-local" onChange={(e) => setEnd(e.target.value)} />
      <button onClick={handleCreate}>Create</button>
    </div>
  )
}