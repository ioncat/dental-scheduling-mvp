import { useState, useEffect } from 'react'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { DoctorSelector } from '@/components/shared/DoctorSelector'
import { WeeklyAvailabilityEditor } from '@/components/availability/WeeklyAvailabilityEditor'
import { TimeOffList } from '@/components/availability/TimeOffList'
import { Label } from '@/components/ui/label'

export default function AvailabilityPage() {
  const { staff, role } = useCurrentStaff()
  // Only admin can manage other doctors' availability (matches RLS policy)
  const isAdmin = role === 'admin'

  // Admin can pick any doctor; others see own only
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined)

  // Default to own ID for non-admin roles
  useEffect(() => {
    if (!isAdmin && staff?.id) {
      setSelectedDoctorId(staff.id)
    }
  }, [isAdmin, staff?.id])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Availability</h1>

      {/* Doctor selector for admin only (RLS restricts others to own availability) */}
      {isAdmin && (
        <div className="max-w-xs space-y-1">
          <Label>Doctor</Label>
          <DoctorSelector
            value={selectedDoctorId}
            onValueChange={setSelectedDoctorId}
            placeholder="Select a doctor..."
          />
        </div>
      )}

      {!selectedDoctorId ? (
        <p className="py-12 text-center text-muted-foreground">
          {isAdmin ? 'Select a doctor to manage their availability.' : 'Loading...'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <WeeklyAvailabilityEditor staffId={selectedDoctorId} canEdit={isAdmin || selectedDoctorId === staff?.id} />
          <TimeOffList staffId={selectedDoctorId} canEdit={isAdmin || selectedDoctorId === staff?.id} />
        </div>
      )}
    </div>
  )
}
