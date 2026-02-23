import { useNavigate } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Patient } from '@/lib/database.types'

interface PatientsTableProps {
  patients: Patient[]
}

export function PatientsTable({ patients }: PatientsTableProps) {
  const navigate = useNavigate()

  if (patients.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No patients found.
      </p>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Messenger</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="cursor-pointer"
              onClick={() => navigate({ to: '/patients/$patientId', params: { patientId: patient.id } })}
            >
              <TableCell className="font-medium">{patient.full_name}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell className="text-muted-foreground">{patient.email ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">
                {patient.messenger
                  ? `${patient.messenger_type ?? ''} ${patient.messenger}`
                  : '—'}
              </TableCell>
              <TableCell>
                {patient.archived ? (
                  <Badge variant="secondary">Archived</Badge>
                ) : (
                  <Badge variant="outline">Active</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
