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
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Check, X } from 'lucide-react'
import type { Staff, StaffRole, StaffStatus } from '@/lib/database.types'

const statusColors: Record<StaffStatus, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
}

export function StaffTable() {
  const { data: staffList, isLoading } = useStaff()
  const { staff: currentUser } = useCurrentStaff()
  const updateRole = useUpdateStaffRole()
  const updateStatus = useUpdateStaffStatus()

  const [confirmDeactivate, setConfirmDeactivate] = useState<Staff | null>(null)

  // Track pending (unsaved) role changes per staff member
  const [pendingRoles, setPendingRoles] = useState<Record<string, StaffRole>>({})

  // Count active admins to prevent losing the last one
  const activeAdminCount = staffList?.filter((s) => s.role === 'admin' && s.status === 'active').length ?? 0

  function handleRoleSelect(memberId: string, originalRole: StaffRole, newRole: StaffRole) {
    if (newRole === originalRole) {
      // Reverted to original — remove pending change
      setPendingRoles((prev) => {
        const next = { ...prev }
        delete next[memberId]
        return next
      })
    } else {
      setPendingRoles((prev) => ({ ...prev, [memberId]: newRole }))
    }
  }

  async function handleSaveRole(memberId: string) {
    const newRole = pendingRoles[memberId]
    if (!newRole) return
    await updateRole.mutateAsync({ id: memberId, role: newRole })
    setPendingRoles((prev) => {
      const next = { ...prev }
      delete next[memberId]
      return next
    })
  }

  function handleCancelRole(memberId: string) {
    setPendingRoles((prev) => {
      const next = { ...prev }
      delete next[memberId]
      return next
    })
  }

  async function handleStatusToggle(staffMember: Staff) {
    if (staffMember.status === 'active') {
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
              const isSelf = member.id === currentUser?.id
              const hasPendingRole = member.id in pendingRoles
              const displayRole = pendingRoles[member.id] ?? member.role

              // Disable role change if: last admin, or only 1 admin changing own role
              const roleDisabled = isLastAdmin && isSelf

              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.full_name}
                    {isSelf && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Select
                        value={displayRole}
                        onValueChange={(v) => handleRoleSelect(member.id, member.role, v as StaffRole)}
                        disabled={roleDisabled}
                      >
                        <SelectTrigger className="w-36" title={roleDisabled ? 'Cannot change role: last admin in the system' : undefined}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="clinic_manager">Clinic Manager</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                        </SelectContent>
                      </Select>
                      {hasPendingRole && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={() => handleSaveRole(member.id)}
                            disabled={updateRole.isPending}
                            title="Save role change"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleCancelRole(member.id)}
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
