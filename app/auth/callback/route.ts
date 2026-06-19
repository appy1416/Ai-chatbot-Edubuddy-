import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Google OAuth callback handler.
 * Uses @supabase/supabase-js only (no @supabase/ssr required).
 *
 * Flow:
 *  1. Google redirects here with ?code=...
 *  2. We exchange the code for a session via the anon client
 *  3. On success → redirect to /dashboard
 *  4. On error   → redirect to /login?error=...
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Surface provider-level errors (user cancelled, etc.)
  if (errorParam) {
    console.error('[Auth Callback] Provider error:', errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription ?? errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard: if Supabase isn't configured, fall back gracefully
  if (
    !supabaseUrl ||
    supabaseUrl === 'your_supabase_project_url' ||
    !supabaseAnonKey ||
    supabaseAnonKey === 'your_supabase_anon_key'
  ) {
    console.warn('[Auth Callback] Supabase not configured — skipping code exchange');
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[Auth Callback] Exchange error:', error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
