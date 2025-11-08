// Supabase configuration using environment variables
// These values should be set in your .env.local file

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oxecaqattfrvtrqhsvtn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZWNhcWF0dGZydnRycWhzdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzYwMjcsImV4cCI6MjA3Nzg1MjAyN30.woxzUJ6Xrqj8BW6fMdLotBQUwupXUBC0Ea0h6qop7eI'

// Extract project ID from URL
export const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
export const publicAnonKey = supabaseAnonKey

// Export full URL and key for Supabase client initialization
export const supabaseUrlExport = supabaseUrl
export const supabaseAnonKeyExport = supabaseAnonKey
