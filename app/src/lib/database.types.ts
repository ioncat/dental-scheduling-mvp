// Database types — manually derived from docs/backend/schema.sql
// Replace with `supabase gen types` output when available

export type StaffRole = 'admin' | 'doctor' | 'clinic_manager'
export type StaffStatus = 'pending' | 'active' | 'inactive'
export type AppointmentStatus = 'scheduled' | 'unassigned' | 'completed' | 'cancelled'
export type MessengerType = 'viber' | 'telegram' | 'other'
export type TimeOffType = 'vacation' | 'sick' | 'blocked'

export interface Practice {
  id: string
  clinic_name: string
  address: string | null
  phone_number: string | null
  contact_email: string | null
  time_zone: string
  date_format: string
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  practice_id: string
  full_name: string
  email: string
  phone_number: string | null
  messenger: string | null
  messenger_type: MessengerType | null
  role: StaffRole
  status: StaffStatus
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  practice_id: string
  full_name: string
  phone: string
  email: string | null
  messenger: string | null
  messenger_type: MessengerType | null
  notes: string | null
  archived: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  practice_id: string
  patient_id: string
  doctor_id: string | null
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Availability {
  id: string
  staff_id: string
  weekday: number
  start_time: string
  end_time: string
  created_at: string
}

export interface TimeOff {
  id: string
  staff_id: string
  start_datetime: string
  end_datetime: string
  type: TimeOffType
  created_at: string
}
