import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPractice, updatePractice } from '@/repositories/practice.repo'
import type { Practice } from '@/lib/database.types'

export function usePractice(id: string | undefined) {
  return useQuery({
    queryKey: ['practice', id],
    queryFn: async () => {
      const { data, error } = await getPractice(id!)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useUpdatePractice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Pick<Practice, 'clinic_name' | 'slogan' | 'show_on_main' | 'address' | 'phone_number' | 'contact_email' | 'time_zone' | 'date_format'>>) => {
      const { data, error } = await updatePractice(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['practice', variables.id] })
    },
  })
}
