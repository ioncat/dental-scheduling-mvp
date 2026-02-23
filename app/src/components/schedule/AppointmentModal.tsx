import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DoctorSelector } from '@/components/shared/DoctorSelector'
import { PatientSelector } from '@/components/shared/PatientSelector'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import type { AppointmentStatus } from '@/lib/database.types'

type ModalMode = 'create' | 'view'

interface AppointmentData {
  id: string
  patient: { id: string; full_name: string } | null
  doctor_id: string | null
  doctor: { id: string; full_name: string } | null
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  practice_id: string
}

interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  appointment?: AppointmentData | null
  defaultDate?: string
  practiceId?: string
}

export function AppointmentModal({
  open,
  onOpenChange,
  mode,
  appointment,
  defaultDate,
  practiceId,
}: AppointmentModalProps) {
  const { role } = useCurrentStaff()
  const createMutation = useCreateAppointment()
  const updateMutation = useUpdateAppointment()

  const [patient, setPatient] = useState<{ id: string; full_name: string } | null>(null)
  const [doctorId, setDoctorId] = useState<string | undefined>(undefined)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    if (mode === 'view' && appointment) {
      setPatient(appointment.patient)
      setDoctorId(appointment.doctor_id ?? undefined)
      setStartTime(appointment.start_time.slice(0, 16))
      setEndTime(appointment.end_time.slice(0, 16))
      setNotes(appointment.notes ?? '')
    } else if (mode === 'create') {
      setPatient(null)
      setDoctorId(undefined)
      setStartTime(defaultDate ? `${defaultDate}T09:00` : '')
      setEndTime(defaultDate ? `${defaultDate}T09:30` : '')
      setNotes('')
    }
  }, [mode, appointment, defaultDate])

  async function handleCreate() {
    if (!patient || !startTime || !endTime || !practiceId) return
    await createMutation.mutateAsync({
      practice_id: practiceId,
      patient_id: patient.id,
      doctor_id: doctorId || null,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      status: doctorId ? 'scheduled' : 'unassigned',
      notes: notes || null,
    })
    onOpenChange(false)
  }

  async function handleCancel() {
    if (!appointment) return
    await updateMutation.mutateAsync({ id: appointment.id, status: 'cancelled' })
    setConfirmCancel(false)
    onOpenChange(false)
  }

  async function handleComplete() {
    if (!appointment) return
    await updateMutation.mutateAsync({ id: appointment.id, status: 'completed' })
    onOpenChange(false)
  }

  async function handleAssignDoctor(newDoctorId: string) {
    if (!appointment) return
    await updateMutation.mutateAsync({
      id: appointment.id,
      doctor_id: newDoctorId,
      status: 'scheduled',
    })
    onOpenChange(false)
  }

  const canManage = role === 'admin' || role === 'clinic_manager'
  const isDoctor = role === 'doctor'
  const isTerminal = appointment?.status === 'completed' || appointment?.status === 'cancelled'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'New Appointment' : 'Appointment Details'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {mode === 'view' && appointment && (
              <div className="flex items-center gap-2">
                <Badge>{appointment.status}</Badge>
                {appointment.doctor?.full_name && (
                  <span className="text-sm text-muted-foreground">
                    Dr. {appointment.doctor.full_name}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Patient</Label>
              {mode === 'create' ? (
                <PatientSelector value={patient} onSelect={setPatient} />
              ) : (
                <Input value={appointment?.patient?.full_name ?? ''} disabled />
              )}
            </div>

            {mode === 'create' && (
              <div className="flex flex-col gap-2">
                <Label>Doctor (optional)</Label>
                <DoctorSelector
                  value={doctorId}
                  onValueChange={setDoctorId}
                  placeholder="Leave unassigned"
                  allowUnassigned
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>End</Label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                disabled={mode === 'view'}
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {mode === 'create' && (
              <Button
                onClick={handleCreate}
                disabled={!patient || !startTime || !endTime || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Appointment'}
              </Button>
            )}

            {mode === 'view' && !isTerminal && (canManage || isDoctor) && (
              <>
                {canManage && appointment?.status === 'unassigned' && (
                  <DoctorSelector
                    value={undefined}
                    onValueChange={handleAssignDoctor}
                    placeholder="Assign doctor..."
                  />
                )}
                {appointment?.status === 'scheduled' && (
                  <Button variant="outline" onClick={handleComplete} disabled={updateMutation.isPending}>
                    Complete
                  </Button>
                )}
                {canManage && (
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmCancel(true)}
                    disabled={updateMutation.isPending}
                  >
                    Cancel Appointment
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Yes, cancel"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </>
  )
}
