import { useQuery } from '@tanstack/react-query'
import { getCurrentStaff } from '@/lib/auth'
import type { Staff, StaffRole } from '@/lib/database.types'

export type { Staff, StaffRole }

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
