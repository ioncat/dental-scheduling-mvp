import { useQuery } from '@tanstack/react-query'
import { getCurrentStaff } from '../lib/auth'

export type StaffRole = 'admin' | 'doctor' | 'clinic_manager'

export interface Staff {
  id: string
  practice_id: string
  full_name: string
  email: string
  phone_number: string | null
  role: StaffRole
  status: 'pending' | 'active' | 'inactive'
}

export function useCurrentStaff() {
  const { data: staff, isLoading, error } = useQuery({
    queryKey: ['current-staff'],
    queryFn: getCurrentStaff,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  return {
    staff: staff as Staff | null,
    role: (staff as Staff | null)?.role ?? null,
    isLoading,
    error,
  }
}
