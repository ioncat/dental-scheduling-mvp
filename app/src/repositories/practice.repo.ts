import { supabase } from '@/lib/supabase'
import type { Practice } from '@/lib/database.types'

export async function getPractice(id: string) {
  return supabase.from('practice').select('*').eq('id', id).single()
}

export async function updatePractice(id: string, updates: Partial<Pick<Practice, 'clinic_name' | 'address' | 'phone_number' | 'contact_email' | 'time_zone' | 'date_format'>>) {
  return supabase.from('practice').update(updates).eq('id', id).select().single()
}
