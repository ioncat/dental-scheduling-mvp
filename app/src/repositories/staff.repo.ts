import { supabase } from '@/lib/supabase'
import type { Staff, StaffRole, StaffStatus } from '@/lib/database.types'

export interface CreateStaffPayload {
  practice_id: string
  full_name: string
  email: string
  role: StaffRole
  phone_number?: string | null
}

export interface StaffFilters {
  role?: StaffRole
  status?: StaffStatus
}

export async function listStaff(filters?: StaffFilters) {
  let query = supabase
    .from('staff')
    .select('*')
    .order('full_name', { ascending: true })

  if (filters?.role) {
    query = query.eq('role', filters.role)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  return query
}

export async function getStaff(id: string) {
  return supabase.from('staff').select('*').eq('id', id).single()
}

export async function createStaff(payload: CreateStaffPayload) {
  return supabase.from('staff').insert({ ...payload, status: 'pending' as StaffStatus }).select().single()
}

export async function updateStaffRole(id: string, role: StaffRole) {
  return supabase.from('staff').update({ role }).eq('id', id).select().single()
}

export async function updateStaffStatus(id: string, status: StaffStatus) {
  return supabase.from('staff').update({ status }).eq('id', id).select().single()
}

export async function listActiveDoctors() {
  return supabase
    .from('staff')
    .select('id, full_name')
    .eq('role', 'doctor')
    .eq('status', 'active')
    .order('full_name', { ascending: true })
}
