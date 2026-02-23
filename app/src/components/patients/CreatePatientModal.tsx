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
import { useCreatePatient } from '@/hooks/usePatients'
import type { MessengerType } from '@/lib/database.types'

interface CreatePatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  practiceId: string | undefined
}

export function CreatePatientModal({ open, onOpenChange, practiceId }: CreatePatientModalProps) {
  const createPatient = useCreatePatient()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [messenger, setMessenger] = useState('')
  const [messengerType, setMessengerType] = useState<MessengerType | ''>('')
  const [notes, setNotes] = useState('')

  function resetForm() {
    setFullName('')
    setPhone('')
    setEmail('')
    setMessenger('')
    setMessengerType('')
    setNotes('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!practiceId || !fullName.trim() || !phone.trim()) return

    await createPatient.mutateAsync({
      practice_id: practiceId,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      messenger: messenger.trim() || null,
      messenger_type: messengerType || null,
      notes: notes.trim() || null,
    })

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Messenger Type</Label>
              <Select value={messengerType} onValueChange={(v) => setMessengerType(v as MessengerType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viber">Viber</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="messenger">Messenger ID</Label>
              <Input
                id="messenger"
                value={messenger}
                onChange={(e) => setMessenger(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {createPatient.error && (
            <p className="text-sm text-destructive">
              {(createPatient.error as Error).message}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPatient.isPending || !fullName.trim() || !phone.trim()}>
              {createPatient.isPending ? 'Saving...' : 'Create Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
