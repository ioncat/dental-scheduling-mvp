import { supabase } from './supabase'

// ⚠️ DEV ONLY — bypass auth for UI development. Remove before merging to main!
const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export async function getCurrentUser() {
  if (DEV_BYPASS_AUTH) {
    return { id: 'dev-bypass', email: 'dev@bypass.local' } as { id: string; email: string }
  }
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getCurrentStaff() {
  if (DEV_BYPASS_AUTH) {
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
