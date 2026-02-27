import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { PatientPickerModal } from '@/components/shared/PatientPickerModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { MiniCalendar } from '@/components/schedule/MiniCalendar'
import { AvailableSlotsList } from '@/components/schedule/AvailableSlotsList'
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments'
import { useAvailability, useTimeOff } from '@/hooks/useAvailability'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { listAppointments } from '@/repositories/appointments.repo'
import { computeFreeSlots, type TimeSlot } from '@/lib/slotUtils'
import { formatDateIso } from '@/lib/timeGrid'
import { cn } from '@/lib/utils'
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
  defaultDoctorId?: string
  defaultStartTime?: string
  defaultEndTime?: string
  practiceId?: string
}

export function AppointmentModal({
  open,
  onOpenChange,
  mode,
  appointment,
  defaultDate,
  defaultDoctorId,
  defaultStartTime,
  defaultEndTime,
  practiceId,
}: AppointmentModalProps) {
  const { role } = useCurrentStaff()
  const createMutation = useCreateAppointment()
  const updateMutation = useUpdateAppointment()

  // --- Shared state ---
  const [patient, setPatient] = useState<{ id: string; full_name: string } | null>(null)
  const [doctorId, setDoctorId] = useState<string | undefined>(undefined)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [patientPickerOpen, setPatientPickerOpen] = useState(false)

  // --- Create mode state ---
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  const dateIso = formatDateIso(selectedDate)

  // --- Data hooks (create mode only) ---
  const { data: availability } = useAvailability(mode === 'create' ? doctorId : undefined)
  const { data: timeOff } = useTimeOff(mode === 'create' ? doctorId : undefined)

  // Fetch existing appointments for this doctor + date (needed for slot conflict check)
  const { data: doctorAppointments, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['appointments', { date: dateIso, doctorId }],
    queryFn: async () => {
      const { data, error } = await listAppointments({ date: dateIso, doctorId: doctorId! })
      if (error) throw error
      return data
    },
    enabled: mode === 'create' && !!doctorId,
  })

  // --- Compute free slots ---
  const freeSlots = useMemo(() => {
    if (!doctorId || !availability || mode !== 'create') return []
    return computeFreeSlots(
      dateIso,
      availability,
      timeOff ?? [],
      (doctorAppointments ?? []).filter((a: { status: string }) => a.status !== 'cancelled'),
    )
  }, [doctorId, dateIso, availability, timeOff, doctorAppointments, mode])

  // --- Create mode handlers ---
  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot)
    setStartTime(slot.startIso)
    setEndTime(slot.endIso)
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSelectedSlot(null)
    setStartTime('')
    setEndTime('')
  }

  function handleDoctorChange(newDoctorId: string) {
    setDoctorId(newDoctorId)
    setSelectedSlot(null)
    setStartTime('')
    setEndTime('')
  }

  // --- Auto-select slot when pre-filled from time-grid click ---
  useEffect(() => {
    if (mode !== 'create' || !defaultStartTime || freeSlots.length === 0) return
    const match = freeSlots.find((s) => s.startIso === defaultStartTime)
    if (match && !selectedSlot) {
      setSelectedSlot(match)
      setStartTime(match.startIso)
      setEndTime(match.endIso)
    }
  }, [freeSlots, defaultStartTime, mode, selectedSlot])

  // --- Initialization effect ---
  useEffect(() => {
    if (mode === 'view' && appointment) {
      setPatient(appointment.patient)
      setDoctorId(appointment.doctor_id ?? undefined)
      setStartTime(appointment.start_time.slice(0, 16))
      setEndTime(appointment.end_time.slice(0, 16))
      setNotes(appointment.notes ?? '')
    } else if (mode === 'create') {
      setPatient(null)
      setDoctorId(defaultDoctorId ?? undefined)
      setNotes('')
      setSelectedSlot(null)

      // Initialize calendar date
      if (defaultDate) {
        setSelectedDate(new Date(defaultDate + 'T12:00:00'))
      } else {
        setSelectedDate(new Date())
      }

      // Pre-populate times if provided (from time-grid click)
      setStartTime(defaultStartTime ?? '')
      setEndTime(defaultEndTime ?? '')
    }
  }, [mode, appointment, defaultDate, defaultDoctorId, defaultStartTime, defaultEndTime])

  // --- Create handler ---
  async function handleCreate() {
    if (!patient || !doctorId || !startTime || !endTime || !practiceId) return
    await createMutation.mutateAsync({
      practice_id: practiceId,
      patient_id: patient.id,
      doctor_id: doctorId,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      status: 'scheduled',
      notes: notes || null,
    })
    onOpenChange(false)
  }

  // --- View mode handlers (unchanged) ---
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

  // --- Empty state message for slots column ---
  const slotsEmptyMessage = !doctorId
    ? 'Select a doctor first'
    : freeSlots.length === 0
      ? 'No available slots'
      : ''

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(mode === 'create' ? 'max-w-5xl' : 'max-w-md')}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'New Appointment' : 'Appointment Details'}
            </DialogTitle>
          </DialogHeader>

          {mode === 'create' ? (
            /* ===== 3-COLUMN CREATE LAYOUT ===== */
            <div className="grid grid-cols-[260px_1fr_200px] gap-6">
              {/* Column 1: Form fields */}
              <div className="flex flex-col gap-4">
                {/* Patient */}
                <div className="flex flex-col gap-2">
                  <Label>Patient</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start font-normal"
                    onClick={() => setPatientPickerOpen(true)}
                  >
                    {patient ? (
                      patient.full_name
                    ) : (
                      <span className="text-muted-foreground">Select patient...</span>
                    )}
                  </Button>
                </div>

                {/* Doctor */}
                <div className="flex flex-col gap-2">
                  <Label>Doctor</Label>
                  <DoctorSelector
                    value={doctorId}
                    onValueChange={handleDoctorChange}
                    placeholder="Select doctor..."
                  />
                </div>

                {/* Selected time summary */}
                {selectedSlot && (
                  <div className="rounded-md border bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedSlot.label} &ndash; {selectedSlot.endIso.split('T')[1]}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div className="flex flex-col gap-2">
                  <Label>Notes</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>

                {/* Error */}
                {createMutation.error && (
                  <p className="text-sm text-destructive">
                    {(createMutation.error as Error).message}
                  </p>
                )}

                {/* Create button */}
                <Button
                  onClick={handleCreate}
                  disabled={
                    !patient || !doctorId || !selectedSlot || createMutation.isPending
                  }
                  className="mt-auto"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Appointment'}
                </Button>
              </div>

              {/* Column 2: Monthly calendar */}
              <div className="flex flex-col items-center border-x px-4">
                <MiniCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
              </div>

              {/* Column 3: Available time slots */}
              <div>
                <AvailableSlotsList
                  slots={freeSlots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  isLoading={isLoadingSlots && !!doctorId}
                  emptyMessage={slotsEmptyMessage}
                />
              </div>
            </div>
          ) : (
            /* ===== VIEW MODE (unchanged) ===== */
            <>
              <div className="flex flex-col gap-4">
                {appointment && (
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
                  <Input value={appointment?.patient?.full_name ?? ''} disabled />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label>Start</Label>
                    <Input type="datetime-local" value={startTime} disabled />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>End</Label>
                    <Input type="datetime-local" value={endTime} disabled />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Notes</Label>
                  <Input value={notes} placeholder="No notes" disabled />
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row">
                {!isTerminal && (canManage || isDoctor) && (
                  <>
                    {canManage && appointment?.status === 'unassigned' && (
                      <DoctorSelector
                        value={undefined}
                        onValueChange={handleAssignDoctor}
                        placeholder="Assign doctor..."
                      />
                    )}
                    {appointment?.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        onClick={handleComplete}
                        disabled={updateMutation.isPending}
                      >
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
            </>
          )}
        </DialogContent>
      </Dialog>

      <PatientPickerModal
        open={patientPickerOpen}
        onOpenChange={setPatientPickerOpen}
        onSelect={setPatient}
      />

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
