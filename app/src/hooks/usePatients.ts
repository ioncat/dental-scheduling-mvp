import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  archivePatient,
  restorePatient,
  searchPatients,
  type CreatePatientPayload,
} from '@/repositories/patients.repo'
import type { Patient } from '@/lib/database.types'

export function usePatients(includeArchived = false) {
  return useQuery({
    queryKey: ['patients', { includeArchived }],
    queryFn: async () => {
      const { data, error } = await listPatients(includeArchived)
      if (error) throw error
      return data
    },
  })
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await getPatient(id!)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useSearchPatients(query: string) {
  return useQuery({
    queryKey: ['patients-search', query],
    queryFn: async () => {
      const { data, error } = await searchPatients(query)
      if (error) throw error
      return data
    },
    enabled: query.length >= 2,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePatientPayload) => {
      const { data, error } = await createPatient(payload)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Pick<Patient, 'full_name' | 'phone' | 'email' | 'messenger' | 'messenger_type' | 'notes'>>) => {
      const { data, error } = await updatePatient(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] })
    },
  })
}

export function useArchivePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await archivePatient(id)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}

export function useRestorePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await restorePatient(id)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
