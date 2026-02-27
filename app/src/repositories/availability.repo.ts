import { supabase } from '@/lib/supabase'
import type { TimeOffType } from '@/lib/database.types'

export interface CreateAvailabilityPayload {
  staff_id: string
  weekday: number
  start_time: string  // HH:MM format
  end_time: string    // HH:MM format
}

export interface CreateTimeOffPayload {
  staff_id: string
  start_datetime: string
  end_datetime: string
  type: TimeOffType
}

// --- Availability (weekly slots) ---

export async function listAvailability(staffId: string) {
  return supabase
    .from('availability')
    .select('*')
    .eq('staff_id', staffId)
    .order('weekday', { ascending: true })
    .order('start_time', { ascending: true })
}

export async function createAvailability(payload: CreateAvailabilityPayload) {
  return supabase.from('availability').insert(payload).select().single()
}

export async function updateAvailability(id: string, updates: Partial<Pick<CreateAvailabilityPayload, 'start_time' | 'end_time'>>) {
  return supabase.from('availability').update(updates).eq('id', id).select().single()
}

export async function deleteAvailability(id: string) {
  return supabase.from('availability').delete().eq('id', id)
}

// --- Time Off ---

export async function listTimeOff(staffId: string) {
  return supabase
    .from('time_off')
    .select('*')
    .eq('staff_id', staffId)
    .order('start_datetime', { ascending: true })
}

export async function createTimeOff(payload: CreateTimeOffPayload) {
  return supabase.from('time_off').insert(payload).select().single()
}

export async function deleteTimeOff(id: string) {
  return supabase.from('time_off').delete().eq('id', id)
}

// --- Batch queries (for time-grid calendar) ---

export async function listAvailabilityForDoctors(staffIds: string[]) {
  return supabase
    .from('availability')
    .select('*')
    .in('staff_id', staffIds)
    .order('weekday', { ascending: true })
    .order('start_time', { ascending: true })
}

export async function listTimeOffForDate(staffIds: string[], dateStart: string, dateEnd: string) {
  return supabase
    .from('time_off')
    .select('*')
    .in('staff_id', staffIds)
    .lte('start_datetime', dateEnd)
    .gte('end_datetime', dateStart)
}
