
import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables from vite.config.ts if available
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xbfpjrdiwzxnohbnpneg.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZnBqcmRpd3p4bm9oYm5wbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzAyODIsImV4cCI6MjA4NDE0NjI4Mn0.rpUzG3dLR7nby8iY4HX6Nyr6Xt8mFTFSIDUTPiLWN68';

if (!supabaseUrl || supabaseUrl === 'undefined' || !supabaseAnonKey || supabaseAnonKey === 'undefined') {
  console.error("Supabase configuration is missing or invalid!");
}

// Create client with fallback values to prevent crash during initialization
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'shetiman-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    }
  }
);
