import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAppointments } from '@/hooks/useAppointments'
import { useStaff } from '@/hooks/useStaff'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { DoctorColumn } from '@/components/schedule/DoctorColumn'
import { UnassignedAlert } from '@/components/schedule/UnassignedAlert'
import { AppointmentModal } from '@/components/schedule/AppointmentModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBanner } from '@/components/shared/ErrorBanner'

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]!
}

export default function SchedulePage() {
  const { staff, role } = useCurrentStaff()
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()))
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'view'>('create')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)

  const { data: appointments, isLoading, error } = useAppointments({ date: selectedDate })
  const { data: allStaff } = useStaff({ role: 'doctor', status: 'active' })

  const canManage = role === 'admin' || role === 'clinic_manager'

  // Group appointments by doctor
  const grouped = useMemo(() => {
    if (!appointments || !allStaff) return []

    const unassigned = appointments.filter((a: any) => !a.doctor_id)
    const doctorMap = new Map<string, { name: string; appointments: any[] }>()

    // Initialize all active doctors
    for (const doc of allStaff) {
      // Doctor role: only show own column
      if (role === 'doctor' && doc.id !== staff?.id) continue
      doctorMap.set(doc.id, { name: doc.full_name, appointments: [] })
    }

    // Distribute appointments to doctors
    for (const apt of appointments) {
      if (apt.doctor_id && doctorMap.has(apt.doctor_id)) {
        doctorMap.get(apt.doctor_id)!.appointments.push(apt)
      }
    }

    const columns = Array.from(doctorMap.entries()).map(([id, data]) => ({
      id,
      ...data,
    }))

    // Add unassigned column if there are unassigned appointments
    if (unassigned.length > 0 && canManage) {
      columns.unshift({ id: 'unassigned', name: 'Unassigned', appointments: unassigned })
    }

    return columns
  }, [appointments, allStaff, role, staff?.id, canManage])

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
    setModalOpen(true)
  }

  function handleCreate() {
    setSelectedAppointmentId(null)
    setModalMode('create')
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
      ) : (
        <div className="flex gap-4 overflow-x-auto rounded-lg border bg-card p-2">
          {grouped.length === 0 ? (
            <p className="w-full py-12 text-center text-muted-foreground">
              No doctors or appointments for this date.
            </p>
          ) : (
            grouped.map((col) => (
              <DoctorColumn
                key={col.id}
                doctorName={col.name}
                appointments={col.appointments}
                onAppointmentClick={handleAppointmentClick}
              />
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        appointment={selectedAppointment}
        defaultDate={selectedDate}
        practiceId={staff?.practice_id}
      />
    </div>
  )
}
