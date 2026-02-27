import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAppointments } from '@/hooks/useAppointments'
import { useStaff } from '@/hooks/useStaff'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { useAllDoctorsAvailability, useAllDoctorsTimeOff } from '@/hooks/useAvailability'
import { UnassignedAlert } from '@/components/schedule/UnassignedAlert'
import { AppointmentModal } from '@/components/schedule/AppointmentModal'
import TimeGridCalendar from '@/components/schedule/TimeGridCalendar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBanner } from '@/components/shared/ErrorBanner'
import type { DoctorColumnData } from '@/components/schedule/TimeGridBody'

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]!
}

export default function SchedulePage() {
  const { staff, role } = useCurrentStaff()
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'view'>('create')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  // Pre-fill state for click-to-create
  const [defaultDoctorId, setDefaultDoctorId] = useState<string | undefined>()
  const [defaultStartTime, setDefaultStartTime] = useState<string | undefined>()
  const [defaultEndTime, setDefaultEndTime] = useState<string | undefined>()

  const { data: appointments, isLoading, error } = useAppointments({ date: selectedDate })
  const { data: allStaff } = useStaff({ role: 'doctor', status: 'active' })

  const canManage = role === 'admin' || role === 'clinic_manager'

  // Build doctor IDs list for batch availability fetch
  const doctorIds = useMemo(() => {
    if (!allStaff) return []
    if (role === 'doctor') return staff?.id ? [staff.id] : []
    return allStaff.map((d: any) => d.id)
  }, [allStaff, role, staff?.id])

  // Batch-fetch availability and time-off for all visible doctors
  const { data: allAvailability } = useAllDoctorsAvailability(doctorIds)
  const { data: allTimeOff } = useAllDoctorsTimeOff(doctorIds, selectedDate)

  // Selected weekday for filtering availability
  const selectedWeekday = new Date(selectedDate + 'T12:00:00').getDay()

  // Group data into columns for TimeGridCalendar
  const { columns, unassigned } = useMemo(() => {
    const unassignedAppts = appointments?.filter((a: any) => !a.doctor_id) ?? []

    if (!allStaff) return { columns: [] as DoctorColumnData[], unassigned: unassignedAppts }

    const cols: DoctorColumnData[] = []

    for (const doc of allStaff) {
      if (role === 'doctor' && doc.id !== staff?.id) continue

      const docAppts = appointments?.filter((a: any) => a.doctor_id === doc.id) ?? []
      const docAvail = (allAvailability ?? []).filter(
        (a: any) => a.staff_id === doc.id && a.weekday === selectedWeekday,
      )
      const docTimeOff = (allTimeOff ?? []).filter((t: any) => t.staff_id === doc.id)

      cols.push({
        id: doc.id,
        name: doc.full_name,
        appointments: docAppts,
        availability: docAvail,
        timeOff: docTimeOff,
      })
    }

    return { columns: cols, unassigned: unassignedAppts }
  }, [appointments, allStaff, allAvailability, allTimeOff, role, staff?.id, selectedWeekday])

  const unassignedCount = appointments?.filter((a: any) => a.status === 'unassigned').length ?? 0

  const selectedAppointment = useMemo(() => {
    if (!selectedAppointmentId || !appointments) return null
    return appointments.find((a: any) => a.id === selectedAppointmentId) ?? null
  }, [selectedAppointmentId, appointments])

  function shiftDate(days: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    setSelectedDate(formatDate(d))
  }

  function handleAppointmentClick(id: string) {
    setSelectedAppointmentId(id)
    setModalMode('view')
    setDefaultDoctorId(undefined)
    setDefaultStartTime(undefined)
    setDefaultEndTime(undefined)
    setModalOpen(true)
  }

  function handleCreate() {
    setSelectedAppointmentId(null)
    setModalMode('create')
    setDefaultDoctorId(undefined)
    setDefaultStartTime(undefined)
    setDefaultEndTime(undefined)
    setModalOpen(true)
  }

  function handleSlotClick(doctorId: string, startIso: string, endIso: string) {
    setSelectedAppointmentId(null)
    setModalMode('create')
    setDefaultDoctorId(doctorId)
    setDefaultStartTime(startIso)
    setDefaultEndTime(endIso)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <h1 className="text-2xl font-semibold">Schedule</h1>

      {/* Date navigation + New Appointment */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => shiftDate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-44"
        />
        <Button variant="outline" size="icon" onClick={() => shiftDate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(formatDate(new Date()))}>
          Today
        </Button>
        {canManage && (
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Appointment
          </Button>
        )}
      </div>

      {/* Unassigned alert */}
      {canManage && <UnassignedAlert count={unassignedCount} />}

      {/* Content */}
      {error && <ErrorBanner message={error.message} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : columns.length === 0 ? (
        <p className="w-full py-12 text-center text-muted-foreground">
          No doctors or appointments for this date.
        </p>
      ) : (
        <TimeGridCalendar
          columns={columns}
          unassigned={unassigned}
          selectedDate={selectedDate}
          canManage={canManage}
          onAppointmentClick={handleAppointmentClick}
          onSlotClick={handleSlotClick}
        />
      )}

      {/* Modal */}
      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        appointment={selectedAppointment}
        defaultDate={selectedDate}
        defaultDoctorId={defaultDoctorId}
        defaultStartTime={defaultStartTime}
        defaultEndTime={defaultEndTime}
        practiceId={staff?.practice_id}
      />
    </div>
  )
}
