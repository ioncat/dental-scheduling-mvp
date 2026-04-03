import { createClient } from '@supabase/supabase-js'

// ⚠️ DEV ONLY — service role key bypasses RLS. Remove before merging to main!
const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  DEV_BYPASS_AUTH && import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    : import.meta.env.VITE_SUPABASE_ANON_KEY
)