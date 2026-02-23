import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Pencil, X, Check } from 'lucide-react'
import { useUpdatePatient } from '@/hooks/usePatients'
import type { Patient, MessengerType } from '@/lib/database.types'

interface PatientInfoCardProps {
  patient: Patient
  canEdit: boolean
}

export function PatientInfoCard({ patient, canEdit }: PatientInfoCardProps) {
  const updatePatient = useUpdatePatient()
  const [editing, setEditing] = useState(false)

  const [fullName, setFullName] = useState(patient.full_name)
  const [phone, setPhone] = useState(patient.phone)
  const [email, setEmail] = useState(patient.email ?? '')
  const [messenger, setMessenger] = useState(patient.messenger ?? '')
  const [messengerType, setMessengerType] = useState<MessengerType | ''>(patient.messenger_type ?? '')
  const [notes, setNotes] = useState(patient.notes ?? '')

  function resetForm() {
    setFullName(patient.full_name)
    setPhone(patient.phone)
    setEmail(patient.email ?? '')
    setMessenger(patient.messenger ?? '')
    setMessengerType(patient.messenger_type ?? '')
    setNotes(patient.notes ?? '')
    setEditing(false)
  }

  async function handleSave() {
    if (!fullName.trim() || !phone.trim()) return

    await updatePatient.mutateAsync({
      id: patient.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      messenger: messenger.trim() || null,
      messenger_type: messengerType || null,
      notes: notes.trim() || null,
    })

    setEditing(false)
  }

  if (!editing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patient Info</CardTitle>
          {canEdit && (
            <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Name" value={patient.full_name} />
          <InfoRow label="Phone" value={patient.phone} />
          <InfoRow label="Email" value={patient.email ?? '—'} />
          <InfoRow
            label="Messenger"
            value={
              patient.messenger
                ? `${patient.messenger_type ?? ''} ${patient.messenger}`
                : '—'
            }
          />
          <InfoRow label="Notes" value={patient.notes ?? '—'} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Edit Patient</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={resetForm}>
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={updatePatient.isPending || !fullName.trim() || !phone.trim()}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="editName">Name *</Label>
          <Input id="editName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="editPhone">Phone *</Label>
          <Input id="editPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="editEmail">Email</Label>
          <Input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
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
          <div className="space-y-1">
            <Label htmlFor="editMessenger">Messenger ID</Label>
            <Input id="editMessenger" value={messenger} onChange={(e) => setMessenger(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="editNotes">Notes</Label>
          <Input id="editNotes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {updatePatient.error && (
          <p className="text-sm text-destructive">
            {(updatePatient.error as Error).message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
