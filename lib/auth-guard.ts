// ─── Auth Guard Utility ───
// Lightweight session check for API routes & middleware.

import { NextRequest, NextResponse } from 'next/server';
import { createUserClient } from '@/lib/supabase-server';

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

/**
 * Validate the request's Authorization header against Supabase.
 * For MVP without Supabase configured, returns a mock user.
 */
export async function validateAuth(request: NextRequest): Promise<AuthResult> {
  // MVP fallback: skip auth when Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
    return { authenticated: true, userId: 'mvp-user', email: 'mvp@edubot.dev' };
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing authentication token' };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createUserClient(token);

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { authenticated: false, error: error?.message || 'Invalid session' };
  }

  return { authenticated: true, userId: user.id, email: user.email };
}

/**
 * Helper: return a 401 JSON response.
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
