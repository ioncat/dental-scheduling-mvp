import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DoctorSelector } from '@/components/shared/DoctorSelector'
import { PatientPickerModal } from '@/components/shared/PatientPickerModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DialogFooter } from '@/components/ui/dialog'
import { useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments'
import { useAvailability, useTimeOff } from '@/hooks/useAvailability'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { listAppointments } from '@/repositories/appointments.repo'
import { computeFreeSlots, type TimeSlot } from '@/lib/slotUtils'
import { formatDateIso } from '@/lib/timeGrid'
import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/lib/database.types'
import { ChevronLeft, ChevronRight, Zap, Calendar, Clock, User, ArrowLeft, Users } from 'lucide-react'

type ModalMode = 'create' | 'view'
type FlowType = 'doctor-first' | 'patient-first'

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

// --- Day pills helpers ---
function getWeekDays(baseDate: Date): Date[] {
  const monday = new Date(baseDate)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
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

  // --- State ---
  const [step, setStep] = useState<1 | 2>(1)
  const [flowType, setFlowType] = useState<FlowType>('doctor-first')
  const [patient, setPatient] = useState<{ id: string; full_name: string } | null>(null)
  const [doctorId, setDoctorId] = useState<string | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [notes, setNotes] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [patientPickerOpen, setPatientPickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [weekBase, setWeekBase] = useState<Date>(() => new Date())

  // View mode state
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const dateIso = formatDateIso(selectedDate)
  const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase.toISOString()])
  const today = new Date()

  // --- Data hooks (create mode) ---
  const { data: availability } = useAvailability(mode === 'create' ? doctorId : undefined)
  const { data: timeOff } = useTimeOff(mode === 'create' ? doctorId : undefined)

  const { data: doctorAppointments, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['appointments', { date: dateIso, doctorId }],
    queryFn: async () => {
      const { data, error } = await listAppointments({ date: dateIso, doctorId: doctorId! })
      if (error) throw error
      return data
    },
    enabled: mode === 'create' && !!doctorId,
  })

  // --- Free slots for selected date ---
  const freeSlots = useMemo(() => {
    if (!doctorId || !availability || mode !== 'create') return []
    return computeFreeSlots(
      dateIso,
      availability,
      timeOff ?? [],
      (doctorAppointments ?? []).filter((a: { status: string }) => a.status !== 'cancelled'),
    )
  }, [doctorId, dateIso, availability, timeOff, doctorAppointments, mode])

  // --- Top 3 suggested slots (next 7 days) ---
  const suggestedSlots = useMemo(() => {
    if (!doctorId || !availability || mode !== 'create') return []
    const suggestions: { slot: TimeSlot; dateLabel: string }[] = []
    const baseDate = new Date()

    for (let i = 0; i < 7 && suggestions.length < 3; i++) {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() + i)
      const dIso = formatDateIso(d)

      const slots = computeFreeSlots(dIso, availability, timeOff ?? [], [])

      const now = new Date()
      const validSlots = i === 0
        ? slots.filter((s) => {
            const [h, m] = s.label.split(':').map(Number) as [number, number]
            return h! * 60 + m! > now.getHours() * 60 + now.getMinutes()
          })
        : slots

      for (const slot of validSlots) {
        if (suggestions.length >= 3) break
        suggestions.push({
          slot,
          dateLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        })
      }
    }
    return suggestions
  }, [doctorId, availability, timeOff, mode])

  // --- Handlers ---
  function handleFlowSwitch(flow: FlowType) {
    setFlowType(flow)
    // Reset selections when switching flow
    if (flow === 'doctor-first') {
      setPatient(null)
    } else {
      setDoctorId(undefined)
      setSelectedSlot(null)
    }
  }

  function handleDoctorChange(newDoctorId: string) {
    setDoctorId(newDoctorId)
    setSelectedSlot(null)
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot)
  }

  function handleSuggestedSelect(slot: TimeSlot, _dateLabel: string) {
    const d = new Date(slot.startIso)
    setSelectedDate(d)
    setWeekBase(d)
    setSelectedSlot(slot)
  }

  function handleWeekPrev() {
    const d = new Date(weekBase)
    d.setDate(d.getDate() - 7)
    setWeekBase(d)
  }

  function handleWeekNext() {
    const d = new Date(weekBase)
    d.setDate(d.getDate() + 7)
    setWeekBase(d)
  }

  // --- Auto-select slot when pre-filled from time-grid click ---
  useEffect(() => {
    if (mode !== 'create' || !defaultStartTime || freeSlots.length === 0) return
    const match = freeSlots.find((s) => s.startIso === defaultStartTime)
    if (match && !selectedSlot) {
      setSelectedSlot(match)
    }
  }, [freeSlots, defaultStartTime, mode, selectedSlot])

  // --- Initialization ---
  useEffect(() => {
    if (mode === 'view' && appointment) {
      setPatient(appointment.patient)
      setDoctorId(appointment.doctor_id ?? undefined)
      setStartTime(appointment.start_time.slice(0, 16))
      setEndTime(appointment.end_time.slice(0, 16))
      setNotes(appointment.notes ?? '')
    } else if (mode === 'create') {
      setStep(1)
      setPatient(null)
      setNotes('')
      setSelectedSlot(null)

      // If opened from schedule grid with a pre-selected doctor, use doctor-first
      if (defaultDoctorId) {
        setFlowType('doctor-first')
        setDoctorId(defaultDoctorId)
      } else {
        setDoctorId(undefined)
      }

      if (defaultDate) {
        const d = new Date(defaultDate + 'T12:00:00')
        setSelectedDate(d)
        setWeekBase(d)
      } else {
        setSelectedDate(new Date())
        setWeekBase(new Date())
      }
    }
  }, [mode, appointment, defaultDate, defaultDoctorId, defaultStartTime, defaultEndTime])

  // --- Create handler ---
  async function handleCreate() {
    if (!patient || !doctorId || !selectedSlot || !practiceId) return
    await createMutation.mutateAsync({
      practice_id: practiceId,
      patient_id: patient.id,
      doctor_id: doctorId,
      start_time: new Date(selectedSlot.startIso).toISOString(),
      end_time: new Date(selectedSlot.endIso).toISOString(),
      status: 'scheduled',
      notes: notes || null,
    })
    onOpenChange(false)
  }

  // --- View mode handlers ---
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

  // Step 1 readiness depends on flow
  const step1Ready = flowType === 'doctor-first'
    ? !!doctorId && !!selectedSlot
    : !!patient && !!doctorId && !!selectedSlot

  // Step 2 label depends on flow
  const step2Label = flowType === 'doctor-first' ? 'Next — Patient Details' : 'Next — Confirm'

  // --- Shared sub-components ---
  function renderDoctorAndSchedule() {
    return (
      <>
        {/* Doctor selector */}
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Doctor
          </Label>
          <DoctorSelector
            value={doctorId}
            onValueChange={handleDoctorChange}
            placeholder="Select doctor..."
          />
        </div>

        {/* Top 3 Suggested Slots */}
        {doctorId && suggestedSlots.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1.5 text-primary">
              <Zap className="h-3.5 w-3.5" /> Suggested Slots
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {suggestedSlots.map(({ slot, dateLabel }, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestedSelect(slot, dateLabel)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-lg border-2 px-2 py-2.5 text-center transition-colors',
                    selectedSlot?.startIso === slot.startIso
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="text-lg font-bold">{slot.label}</span>
                  <span className="text-[11px] text-muted-foreground">{dateLabel}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Day pills with week navigation */}
        {doctorId && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Select Day
              </Label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleWeekPrev}
                  className="rounded p-1 hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-muted-foreground">
                  {weekDays[0]!.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={handleWeekNext}
                  className="rounded p-1 hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate)
                const isToday = isSameDay(day, today)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      'flex flex-col items-center rounded-lg py-2 text-xs transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : isToday
                          ? 'border-2 border-primary/30 hover:bg-muted'
                          : 'hover:bg-muted',
                    )}
                  >
                    <span className="text-[10px] font-medium opacity-70">{DAY_NAMES[i]}</span>
                    <span className="text-base font-bold">{day.getDate()}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Time slot chips */}
        {doctorId && (
          <div className="flex flex-col gap-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Available Times
            </Label>
            {isLoadingSlots ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : freeSlots.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No available slots for this day
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {freeSlots.map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={cn(
                      'rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-colors',
                      selectedSlot?.startIso === slot.startIso
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(mode === 'create' ? 'max-w-lg' : 'max-w-md')}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? step === 1
                  ? 'New Appointment'
                  : flowType === 'doctor-first'
                    ? 'Patient Details'
                    : 'Confirm Appointment'
                : 'Appointment Details'}
            </DialogTitle>
          </DialogHeader>

          {mode === 'create' ? (
            step === 1 ? (
              /* ===== STEP 1 ===== */
              <div className="flex flex-col gap-5">
                {/* Flow type toggle — only show when NOT pre-filled from grid click */}
                {!defaultDoctorId && (
                  <div className="flex rounded-lg border p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleFlowSwitch('doctor-first')}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        flowType === 'doctor-first'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )}
                    >
                      <User className="h-3.5 w-3.5" />
                      Doctor first
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFlowSwitch('patient-first')}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        flowType === 'patient-first'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Patient first
                    </button>
                  </div>
                )}

                {flowType === 'doctor-first' ? (
                  /* --- Doctor-first: Doctor → Date → Time --- */
                  renderDoctorAndSchedule()
                ) : (
                  /* --- Patient-first: Patient → Doctor → Date → Time --- */
                  <>
                    {/* Patient selector */}
                    <div className="flex flex-col gap-2">
                      <Label className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Patient
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start font-normal',
                          patient && 'border-primary/50 bg-primary/5',
                        )}
                        onClick={() => setPatientPickerOpen(true)}
                      >
                        {patient ? (
                          <span className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {patient.full_name.charAt(0)}
                            </span>
                            {patient.full_name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Select patient...</span>
                        )}
                      </Button>
                    </div>

                    {/* Doctor + schedule — show after patient is selected */}
                    {patient && renderDoctorAndSchedule()}
                  </>
                )}

                {/* Next button */}
                <Button
                  onClick={() => setStep(2)}
                  disabled={!step1Ready}
                  className="mt-1"
                >
                  {step2Label}
                </Button>
              </div>
            ) : (
              /* ===== STEP 2 ===== */
              <div className="flex flex-col gap-5">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to {flowType === 'doctor-first' ? 'time selection' : 'schedule'}
                </button>

                {/* Summary */}
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xl font-bold">
                    {selectedSlot?.label} — {selectedSlot?.endIso.split('T')[1]}
                  </p>
                  {/* Show patient in summary if patient-first */}
                  {flowType === 'patient-first' && patient && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Patient: <span className="font-medium text-foreground">{patient.full_name}</span>
                    </p>
                  )}
                </div>

                {/* Patient picker — only in doctor-first flow */}
                {flowType === 'doctor-first' && (
                  <div className="flex flex-col gap-2">
                    <Label>Patient</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start font-normal"
                      onClick={() => setPatientPickerOpen(true)}
                    >
                      {patient ? (
                        <span className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {patient.full_name.charAt(0)}
                          </span>
                          {patient.full_name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select patient...</span>
                      )}
                    </Button>
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
                  disabled={!patient || createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Appointment'}
                </Button>
              </div>
            )
          ) : (
            /* ===== VIEW MODE ===== */
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
