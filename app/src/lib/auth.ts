import { supabase } from './supabase'

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getCurrentStaff() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data } = await supabase
    .from('staff')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}
