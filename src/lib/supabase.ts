import { createClient } from '@supabase/supabase-js'
import { supabaseUrlExport, supabaseAnonKeyExport } from '../utils/supabase/info'

// Create Supabase client for direct database, storage, and auth access
// Using anon key allows public access (RLS policies control what's allowed)
export const supabase = createClient(supabaseUrlExport, supabaseAnonKeyExport, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKeyExport,
      'Authorization': `Bearer ${supabaseAnonKeyExport}`
    }
  }
})

// Helper to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

