import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { usePatients } from '@/hooks/usePatients'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { PatientsTable } from '@/components/patients/PatientsTable'
import { CreatePatientModal } from '@/components/patients/CreatePatientModal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBanner } from '@/components/shared/ErrorBanner'

export default function PatientsPage() {
  const { staff, role } = useCurrentStaff()
  const canManage = role === 'admin' || role === 'clinic_manager'

  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const { data: patients, isLoading, error } = usePatients(showArchived)

  const filtered = useMemo(() => {
    if (!patients) return []
    if (!search.trim()) return patients
    const q = search.toLowerCase()
    return patients.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q))
    )
  }, [patients, search])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        {canManage && (
          <Button onClick={() => setModalOpen(true)} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Patient
          </Button>
        )}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showArchived ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </Button>
      </div>

      {/* Content */}
      {error && <ErrorBanner message={error.message} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <PatientsTable patients={filtered} />
      )}

      {/* Create modal */}
      <CreatePatientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        practiceId={staff?.practice_id}
      />
    </div>
  )
}
