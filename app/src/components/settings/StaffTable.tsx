import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useStaff, useUpdateStaffRole, useUpdateStaffStatus } from '@/hooks/useStaff'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Staff, StaffRole, StaffStatus } from '@/lib/database.types'

const statusColors: Record<StaffStatus, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
}

export function StaffTable() {
  const { data: staffList, isLoading } = useStaff()
  const updateRole = useUpdateStaffRole()
  const updateStatus = useUpdateStaffStatus()

  const [confirmDeactivate, setConfirmDeactivate] = useState<Staff | null>(null)

  // Count active admins to prevent deactivating the last one
  const activeAdminCount = staffList?.filter((s) => s.role === 'admin' && s.status === 'active').length ?? 0

  async function handleRoleChange(staffMember: Staff, newRole: StaffRole) {
    await updateRole.mutateAsync({ id: staffMember.id, role: newRole })
  }

  async function handleStatusToggle(staffMember: Staff) {
    if (staffMember.status === 'active') {
      // Check: don't deactivate last admin
      if (staffMember.role === 'admin' && activeAdminCount <= 1) return
      setConfirmDeactivate(staffMember)
    } else {
      await updateStatus.mutateAsync({ id: staffMember.id, status: 'active' })
    }
  }

  async function handleConfirmDeactivate() {
    if (!confirmDeactivate) return
    await updateStatus.mutateAsync({ id: confirmDeactivate.id, status: 'inactive' })
    setConfirmDeactivate(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (!staffList || staffList.length === 0) {
    return <p className="py-6 text-center text-muted-foreground">No staff members.</p>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.map((member) => {
              const isLastAdmin = member.role === 'admin' && activeAdminCount <= 1
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      onValueChange={(v) => handleRoleChange(member, v as StaffRole)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="clinic_manager">Clinic Manager</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[member.status]} variant="secondary">
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(member)}
                      disabled={
                        (member.status === 'active' && isLastAdmin) ||
                        updateStatus.isPending
                      }
                      title={
                        member.status === 'active' && isLastAdmin
                          ? 'Cannot deactivate the last admin'
                          : undefined
                      }
                    >
                      {member.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!confirmDeactivate}
        onOpenChange={(open) => !open && setConfirmDeactivate(null)}
        title="Deactivate Staff"
        description={`Deactivating ${confirmDeactivate?.full_name} will remove their access. Any assigned appointments will become unassigned.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={handleConfirmDeactivate}
      />
    </>
  )
}
