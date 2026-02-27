import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  listTimeOff,
  createTimeOff,
  deleteTimeOff,
  listAvailabilityForDoctors,
  listTimeOffForDate,
  type CreateAvailabilityPayload,
  type CreateTimeOffPayload,
} from '@/repositories/availability.repo'

// --- Availability hooks ---

export function useAvailability(staffId: string | undefined) {
  return useQuery({
    queryKey: ['availability', staffId],
    queryFn: async () => {
      const { data, error } = await listAvailability(staffId!)
      if (error) throw error
      return data
    },
    enabled: !!staffId,
  })
}

export function useCreateAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateAvailabilityPayload) => {
      const { data, error } = await createAvailability(payload)
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['availability', variables.staff_id] })
    },
  })
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, staffId, ...updates }: { id: string; staffId: string; start_time?: string; end_time?: string }) => {
      const { data, error } = await updateAvailability(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['availability', variables.staffId] })
    },
  })
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, staffId: _staffId }: { id: string; staffId: string }) => {
      const { error } = await deleteAvailability(id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['availability', variables.staffId] })
    },
  })
}

// --- Time Off hooks ---

export function useTimeOff(staffId: string | undefined) {
  return useQuery({
    queryKey: ['time-off', staffId],
    queryFn: async () => {
      const { data, error } = await listTimeOff(staffId!)
      if (error) throw error
      return data
    },
    enabled: !!staffId,
  })
}

export function useCreateTimeOff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTimeOffPayload) => {
      const { data, error } = await createTimeOff(payload)
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-off', variables.staff_id] })
    },
  })
}

export function useDeleteTimeOff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, staffId: _staffId }: { id: string; staffId: string }) => {
      const { error } = await deleteTimeOff(id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-off', variables.staffId] })
    },
  })
}

// --- Batch hooks for time-grid calendar ---

export function useAllDoctorsAvailability(staffIds: string[]) {
  return useQuery({
    queryKey: ['availability', 'all', staffIds],
    queryFn: async () => {
      const { data, error } = await listAvailabilityForDoctors(staffIds)
      if (error) throw error
      return data
    },
    enabled: staffIds.length > 0,
  })
}

export function useAllDoctorsTimeOff(staffIds: string[], date: string) {
  const dayStart = `${date}T00:00:00Z`
  const dayEnd = `${date}T23:59:59Z`
  return useQuery({
    queryKey: ['time-off', 'all', staffIds, date],
    queryFn: async () => {
      const { data, error } = await listTimeOffForDate(staffIds, dayStart, dayEnd)
      if (error) throw error
      return data
    },
    enabled: staffIds.length > 0,
  })
}
