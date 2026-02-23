import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useArchivePatient, useRestorePatient } from '@/hooks/usePatients'
import { useAppointments } from '@/hooks/useAppointments'
import { Archive, ArchiveRestore } from 'lucide-react'

interface ArchiveButtonProps {
  patientId: string
  archived: boolean
}

export function ArchiveButton({ patientId, archived }: ArchiveButtonProps) {
  const archivePatient = useArchivePatient()
  const restorePatient = useRestorePatient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Check for future appointments (disable archive if any exist)
  const { data: appointments } = useAppointments({ patientId })
  const hasFutureAppointments = appointments?.some((apt: any) => {
    if (apt.status === 'cancelled' || apt.status === 'completed') return false
    return new Date(apt.start_time) > new Date()
  }) ?? false

  async function handleConfirm() {
    if (archived) {
      await restorePatient.mutateAsync(patientId)
    } else {
      await archivePatient.mutateAsync(patientId)
    }
    setConfirmOpen(false)
  }

  if (archived) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={restorePatient.isPending}
        >
          <ArchiveRestore className="mr-1 h-4 w-4" />
          Restore
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Restore Patient"
          description="This will restore the patient and make them visible in patient lists again."
          confirmLabel="Restore"
          onConfirm={handleConfirm}
        />
      </>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={archivePatient.isPending || hasFutureAppointments}
        title={hasFutureAppointments ? 'Cannot archive: patient has future appointments' : undefined}
      >
        <Archive className="mr-1 h-4 w-4" />
        Archive
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Archive Patient"
        description="This will hide the patient from active lists. You can restore them later."
        confirmLabel="Archive"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    </>
  )
}
