import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft } from 'lucide-react'
import { usePatient } from '@/hooks/usePatients'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { PatientInfoCard } from '@/components/patients/PatientInfoCard'
import { AppointmentHistory } from '@/components/patients/AppointmentHistory'
import { ArchiveButton } from '@/components/patients/ArchiveButton'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBanner } from '@/components/shared/ErrorBanner'

export default function PatientDetailsPage() {
  const { patientId } = useParams({ strict: false }) as { patientId: string }
  const navigate = useNavigate()
  const { role } = useCurrentStaff()
  const canManage = role === 'admin' || role === 'clinic_manager'

  const { data: patient, isLoading, error } = usePatient(patientId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorBanner message={error.message} />
  }

  if (!patient) {
    return <ErrorBanner message="Patient not found." />
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/patients' })}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">{patient.full_name}</h1>
        {patient.archived && <Badge variant="secondary">Archived</Badge>}
        <div className="ml-auto">
          {canManage && (
            <ArchiveButton patientId={patient.id} archived={patient.archived} />
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <PatientInfoCard patient={patient} canEdit={canManage} />
        <AppointmentHistory patientId={patient.id} />
      </div>
    </div>
  )
}
