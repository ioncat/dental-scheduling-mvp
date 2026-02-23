import { supabase } from '@/lib/supabase'
import type { Appointment, AppointmentStatus } from '@/lib/database.types'

export interface AppointmentFilters {
  date?: string          // ISO date string, e.g. "2026-02-23"
  doctorId?: string
  status?: AppointmentStatus
  patientId?: string
}

export interface CreateAppointmentPayload {
  practice_id: string
  patient_id: string
  doctor_id?: string | null
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes?: string | null
}

export async function listAppointments(filters?: AppointmentFilters) {
  let query = supabase
    .from('appointment')
    .select('*, patient:patient_id(id, full_name, phone), doctor:doctor_id(id, full_name)')
    .order('start_time', { ascending: true })

  if (filters?.date) {
    const dayStart = `${filters.date}T00:00:00Z`
    const dayEnd = `${filters.date}T23:59:59Z`
    query = query.gte('start_time', dayStart).lte('start_time', dayEnd)
  }
  if (filters?.doctorId) {
    query = query.eq('doctor_id', filters.doctorId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.patientId) {
    query = query.eq('patient_id', filters.patientId)
  }

  return query
}

export async function getAppointment(id: string) {
  return supabase
    .from('appointment')
    .select('*, patient:patient_id(id, full_name, phone), doctor:doctor_id(id, full_name)')
    .eq('id', id)
    .single()
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  return supabase.from('appointment').insert(payload).select().single()
}

export async function updateAppointment(id: string, updates: Partial<Pick<Appointment, 'doctor_id' | 'start_time' | 'end_time' | 'status' | 'notes'>>) {
  return supabase.from('appointment').update(updates).eq('id', id).select().single()
}
