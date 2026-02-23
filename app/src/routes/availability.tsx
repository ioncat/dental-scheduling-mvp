import { useState, useEffect } from 'react'
import { useCurrentStaff } from '@/hooks/useCurrentStaff'
import { DoctorSelector } from '@/components/shared/DoctorSelector'
import { WeeklyAvailabilityEditor } from '@/components/availability/WeeklyAvailabilityEditor'
import { TimeOffList } from '@/components/availability/TimeOffList'
import { Label } from '@/components/ui/label'

export default function AvailabilityPage() {
  const { staff, role } = useCurrentStaff()
  const canManage = role === 'admin' || role === 'clinic_manager'

  // Admin/manager can pick any doctor; doctor sees own only
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(undefined)

  // Default to own ID for doctors
  useEffect(() => {
    if (role === 'doctor' && staff?.id) {
      setSelectedDoctorId(staff.id)
    }
  }, [role, staff?.id])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Availability</h1>

      {/* Doctor selector for admin/manager */}
      {canManage && (
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
          {canManage ? 'Select a doctor to manage their availability.' : 'Loading...'}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <WeeklyAvailabilityEditor staffId={selectedDoctorId} canEdit={canManage || role === 'doctor'} />
          <TimeOffList staffId={selectedDoctorId} canEdit={canManage || role === 'doctor'} />
        </div>
      )}
    </div>
  )
}
