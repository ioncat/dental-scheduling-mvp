import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  type AppointmentFilters,
  type CreateAppointmentPayload,
} from '@/repositories/appointments.repo'
import type { Appointment } from '@/lib/database.types'

export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      const { data, error } = await listAppointments(filters)
      if (error) throw error
      return data
    },
  })
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const { data, error } = await getAppointment(id!)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateAppointmentPayload) => {
      const { data, error } = await createAppointment(payload)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Pick<Appointment, 'doctor_id' | 'start_time' | 'end_time' | 'status' | 'notes'>>) => {
      const { data, error } = await updateAppointment(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointment'] })
    },
  })
}
