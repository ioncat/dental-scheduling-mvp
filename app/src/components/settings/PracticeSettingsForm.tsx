import { useState, useEffect } from 'react'
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
import { usePractice, useUpdatePractice } from '@/hooks/usePractice'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBanner } from '@/components/shared/ErrorBanner'

interface PracticeSettingsFormProps {
  practiceId: string
}

export function PracticeSettingsForm({ practiceId }: PracticeSettingsFormProps) {
  const { data: practice, isLoading, error } = usePractice(practiceId)
  const updatePractice = useUpdatePractice()

  const [clinicName, setClinicName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [timeZone, setTimeZone] = useState('')
  const [dateFormat, setDateFormat] = useState('')

  useEffect(() => {
    if (practice) {
      setClinicName(practice.clinic_name)
      setAddress(practice.address ?? '')
      setPhone(practice.phone_number ?? '')
      setEmail(practice.contact_email ?? '')
      setTimeZone(practice.time_zone)
      setDateFormat(practice.date_format)
    }
  }, [practice])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!clinicName.trim()) return

    await updatePractice.mutateAsync({
      id: practiceId,
      clinic_name: clinicName.trim(),
      address: address.trim() || null,
      phone_number: phone.trim() || null,
      contact_email: email.trim() || null,
      time_zone: timeZone,
      date_format: dateFormat,
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <ErrorBanner message={error.message} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name *</Label>
            <Input
              id="clinicName"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="practicePhone">Phone</Label>
              <Input
                id="practicePhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="practiceEmail">Email</Label>
              <Input
                id="practiceEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select value={timeZone} onValueChange={setTimeZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Kyiv">Europe/Kyiv</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {updatePractice.error && (
            <p className="text-sm text-destructive">
              {(updatePractice.error as Error).message}
            </p>
          )}

          {updatePractice.isSuccess && (
            <p className="text-sm text-green-600">Settings saved.</p>
          )}

          <Button type="submit" disabled={updatePractice.isPending || !clinicName.trim()}>
            {updatePractice.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
