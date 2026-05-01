// ─── Supabase Server Client ───
// Use in API routes and server components only.
// Never import this file from client components.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Creates a Supabase client with the service role key.
 * Has admin-level access — use only in trusted server contexts.
 */
export function createServerClient(): SupabaseClient<Database> {
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient<Database>(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Creates a Supabase client scoped to a user's JWT.
 * Pass the Authorization header from the request.
 */
export function createUserClient(accessToken: string): SupabaseClient<Database> {
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
