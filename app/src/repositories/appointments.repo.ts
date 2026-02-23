import { supabase } from '../lib/supabase'

export async function listAppointments() {
  return supabase.from('appointment').select('*')
}

export async function createAppointment(payload: any) {
  return supabase.from('appointment').insert(payload)
}
