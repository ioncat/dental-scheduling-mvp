import { supabase } from '@/lib/supabase'
import type { Patient } from '@/lib/database.types'

export interface CreatePatientPayload {
  practice_id: string
  full_name: string
  phone: string
  email?: string | null
  messenger?: string | null
  messenger_type?: Patient['messenger_type']
  notes?: string | null
}

export async function listPatients(includeArchived = false) {
  let query = supabase
    .from('patient')
    .select('*')
    .order('full_name', { ascending: true })

  if (!includeArchived) {
    query = query.eq('archived', false)
  }

  return query
}

export async function getPatient(id: string) {
  return supabase.from('patient').select('*').eq('id', id).single()
}

export async function createPatient(payload: CreatePatientPayload) {
  return supabase.from('patient').insert(payload).select().single()
}

export async function updatePatient(id: string, updates: Partial<Pick<Patient, 'full_name' | 'phone' | 'email' | 'messenger' | 'messenger_type' | 'notes'>>) {
  return supabase.from('patient').update(updates).eq('id', id).select().single()
}

export async function archivePatient(id: string) {
  return supabase.from('patient').update({ archived: true }).eq('id', id).select().single()
}

export async function restorePatient(id: string) {
  return supabase.from('patient').update({ archived: false }).eq('id', id).select().single()
}

export async function searchPatients(query: string) {
  return supabase
    .from('patient')
    .select('*')
    .eq('archived', false)
    .ilike('full_name', `%${query}%`)
    .order('full_name', { ascending: true })
    .limit(20)
}
