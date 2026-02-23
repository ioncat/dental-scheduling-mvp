import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listStaff,
  getStaff,
  createStaff,
  updateStaffRole,
  updateStaffStatus,
  listActiveDoctors,
  type CreateStaffPayload,
  type StaffFilters,
} from '@/repositories/staff.repo'
import type { StaffRole, StaffStatus } from '@/lib/database.types'

export function useStaff(filters?: StaffFilters) {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: async () => {
      const { data, error } = await listStaff(filters)
      if (error) throw error
      return data
    },
  })
}

export function useStaffMember(id: string | undefined) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: async () => {
      const { data, error } = await getStaff(id!)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useActiveDoctors() {
  return useQuery({
    queryKey: ['staff', 'active-doctors'],
    queryFn: async () => {
      const { data, error } = await listActiveDoctors()
      if (error) throw error
      return data
    },
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      const { data, error } = await createStaff(payload)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: StaffRole }) => {
      const { data, error } = await updateStaffRole(id, role)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StaffStatus }) => {
      const { data, error } = await updateStaffStatus(id, status)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      queryClient.invalidateQueries({ queryKey: ['current-staff'] })
    },
  })
}
