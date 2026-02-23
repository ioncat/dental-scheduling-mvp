import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateStaff } from '@/hooks/useStaff'
import type { StaffRole } from '@/lib/database.types'

interface InviteStaffModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  practiceId: string | undefined
}

export function InviteStaffModal({ open, onOpenChange, practiceId }: InviteStaffModalProps) {
  const createStaff = useCreateStaff()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StaffRole>('doctor')

  function resetForm() {
    setFullName('')
    setEmail('')
    setRole('doctor')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!practiceId || !fullName.trim() || !email.trim()) return

    await createStaff.mutateAsync({
      practice_id: practiceId,
      full_name: fullName.trim(),
      email: email.trim(),
      role,
    })

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staffName">Full Name *</Label>
            <Input
              id="staffName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffEmail">Email *</Label>
            <Input
              id="staffEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="clinic_manager">Clinic Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {createStaff.error && (
            <p className="text-sm text-destructive">
              {(createStaff.error as Error).message}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStaff.isPending || !fullName.trim() || !email.trim()}>
              {createStaff.isPending ? 'Inviting...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
