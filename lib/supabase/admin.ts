import { createClient } from '@supabase/supabase-js'

// Service role client - bypasses RLS
// Use ONLY in server-side API routes where no user session exists (payment routes, webhooks)
// Never expose this client to the browser
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
