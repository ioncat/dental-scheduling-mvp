import { supabase } from './supabase'

// ⚠️ DEV ONLY — bypass auth for UI redesign. Remove before merging to main!
const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export async function getCurrentUser() {
  if (DEV_BYPASS_AUTH) {
    // Return a fake user object to pass router auth guards
    return { id: 'dev-bypass', email: 'dev@bypass.local' } as any
  }
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getCurrentStaff() {
  if (DEV_BYPASS_AUTH) {
    // Fetch first active admin from real DB data
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('role', 'admin')
      .eq('status', 'active')
      .limit(1)
      .single()
    return data
  }

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
