import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function getSupabaseAdmin() {
  const isConfigured = Boolean(
    supabaseUrl && 
    serviceRoleKey && 
    !supabaseUrl.includes('your-project') &&
    !serviceRoleKey.includes('your-service')
  );

  if (!isConfigured) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
