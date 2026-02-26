import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePatients } from '@/hooks/usePatients'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface PatientPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (patient: { id: string; full_name: string }) => void
}

export function PatientPickerModal({ open, onOpenChange, onSelect }: PatientPickerModalProps) {
  const [search, setSearch] = useState('')
  const { data: patients, isLoading } = usePatients(false)

  const filtered = patients?.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    )
  })

  function handleSelect(patient: { id: string; full_name: string }) {
    onSelect(patient)
    setSearch('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Patient</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : !filtered || filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No patients found.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer"
                      onClick={() => handleSelect({ id: patient.id, full_name: patient.full_name })}
                    >
                      <TableCell className="font-medium">{patient.full_name}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.email ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
