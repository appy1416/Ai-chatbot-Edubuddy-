import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// ─── Environment Variables ───
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// ─── Configuration Check ───
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    supabaseUrl !== 'your_supabase_project_url' &&
    Boolean(supabaseAnonKey) &&
    supabaseAnonKey !== 'your_supabase_anon_key'
  );
}

// ─── Client (Browser) ───
// Used in client components and hooks.
function createBrowserClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = createBrowserClient();

// ─── Auth Helpers ───

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('[Supabase] getUser error:', error.message);
    return null;
  }
  return user;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[Supabase] getSession error:', error.message);
    return null;
  }
  return session;
}
