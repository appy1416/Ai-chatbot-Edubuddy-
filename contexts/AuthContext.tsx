'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, EducationLevel, SupportedLanguage } from '@/types';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  sendOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function makeProfile(id: string, email: string, fullName?: string): Profile {
  return {
    id,
    email,
    full_name: fullName ?? email.split('@')[0],
    education_level: 'degree' as EducationLevel,
    preferred_language: 'english' as SupportedLanguage,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Persist helpers ───────────────────────────────────────────
  const persistSession = useCallback((u: AuthUser, p: Profile) => {
    setUser(u);
    setProfile(p);
    try {
      localStorage.setItem('edubot_user', JSON.stringify({ user: u, profile: p }));
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setProfile(null);
    try {
      localStorage.removeItem('edubot_user');
    } catch { /* ignore */ }
  }, []);

  // ─── Initialise session on mount ───────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (isSupabaseConfigured()) {
        // ── Supabase path ──────────────────────────────────────
        try {
          // getSession reads the persisted cookie/localStorage token
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('[Auth] getSession error:', error.message);
          }
          if (session?.user && mounted) {
            const u = { id: session.user.id, email: session.user.email ?? '' };
            const p = makeProfile(u.id, u.email, session.user.user_metadata?.full_name);
            persistSession(u, p);
          }
        } catch (err) {
          console.error('[Auth] initSession error:', err);
        } finally {
          if (mounted) setLoading(false);
        }

        // ── Real-time auth state listener ──────────────────────
        // This fires whenever Supabase detects a session change,
        // including after the OAuth callback redirects back to the app.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (!mounted) return;
            console.log('[Auth] onAuthStateChange event:', _event, '| session:', !!session);
            if (session?.user) {
              const u = { id: session.user.id, email: session.user.email ?? '' };
              const p = makeProfile(u.id, u.email, session.user.user_metadata?.full_name);
              persistSession(u, p);
            } else {
              clearSession();
            }
            setLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } else {
        // ── MVP fallback path ──────────────────────────────────
        try {
          const stored = localStorage.getItem('edubot_user');
          if (stored && mounted) {
            const parsed = JSON.parse(stored) as { user: AuthUser; profile: Profile };
            if (parsed.user) setUser(parsed.user);
            if (parsed.profile) setProfile(parsed.profile);
          }
        } catch {
          localStorage.removeItem('edubot_user');
        } finally {
          if (mounted) setLoading(false);
        }
      }
    }

    const cleanup = initSession();
    return () => {
      mounted = false;
      cleanup?.then(fn => fn?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── signUp ────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };
        if (data.user) {
          const u = { id: data.user.id, email: data.user.email ?? email };
          persistSession(u, makeProfile(u.id, u.email, fullName));
        }
        return { error: null };
      }

      // MVP fallback
      const id = crypto.randomUUID();
      const u = { id, email };
      const p = makeProfile(id, email, fullName);
      const storedUsers = localStorage.getItem('edubot_users');
      const users = storedUsers ? JSON.parse(storedUsers) : {};
      users[email] = { user: u, profile: p, password };
      localStorage.setItem('edubot_users', JSON.stringify(users));
      persistSession(u, p);
      return { error: null };
    } catch (err) {
      console.error('[Auth] signUp error:', err);
      return { error: 'An unexpected error occurred' };
    }
  };

  // ─── signIn ────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (data.user) {
          const u = { id: data.user.id, email: data.user.email ?? email };
          persistSession(u, makeProfile(u.id, u.email));
        }
        return { error: null };
      }

      // MVP fallback
      const stored = localStorage.getItem('edubot_users');
      const users = stored ? JSON.parse(stored) : {};
      if (users[email]) {
        if (users[email].password === password) {
          persistSession(users[email].user, users[email].profile);
          return { error: null };
        }
        return { error: 'Invalid password' };
      }
      // Create on the fly for ease of testing
      const id = crypto.randomUUID();
      const u = { id, email };
      persistSession(u, makeProfile(id, email));
      return { error: null };
    } catch (err) {
      console.error('[Auth] signIn error:', err);
      return { error: 'An unexpected error occurred' };
    }
  };

  // ─── signInWithGoogle ──────────────────────────────────────────
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      if (isSupabaseConfigured()) {
        console.log('[Auth] Starting Supabase Google OAuth…');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) {
          console.error('[Auth] signInWithGoogle error:', error.message);
          return { error: error.message };
        }
        // Supabase will redirect the browser — return here to keep loading state
        return { error: null };
      }

      // ── MVP mock (no Supabase configured) ─────────────────────
      console.log('[Auth] MVP mock Google sign-in (Supabase not configured)');
      await new Promise(res => setTimeout(res, 600));
      const id = crypto.randomUUID();
      const email = `google-${id.slice(0, 8)}@example.com`;
      const u = { id, email };
      const p = makeProfile(id, email, 'Google User');
      persistSession(u, p);
      return { error: null };
    } catch (err) {
      console.error('[Auth] signInWithGoogle unexpected error:', err);
      return { error: 'An unexpected error occurred during Google sign-in' };
    }
  };

  // ─── sendOtp ───────────────────────────────────────────────────
  const sendOtp = async (email: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) return { error: error.message };
        return { error: null };
      }
      await new Promise(res => setTimeout(res, 600));
      return { error: null };
    } catch (err) {
      console.error('[Auth] sendOtp error:', err);
      return { error: 'An unexpected error occurred sending OTP' };
    }
  };

  // ─── verifyOtp ─────────────────────────────────────────────────
  const verifyOtp = async (email: string, token: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
        if (error) return { error: error.message };
        if (data.user) {
          const u = { id: data.user.id, email: data.user.email ?? email };
          persistSession(u, makeProfile(u.id, u.email));
        }
        return { error: null };
      }
      await new Promise(res => setTimeout(res, 600));
      if (token.length !== 6) return { error: 'Invalid Code' };
      const id = crypto.randomUUID();
      const u = { id, email };
      persistSession(u, makeProfile(id, email));
      return { error: null };
    } catch (err) {
      console.error('[Auth] verifyOtp error:', err);
      return { error: 'An unexpected error occurred verifying OTP' };
    }
  };

  // ─── signOut ───────────────────────────────────────────────────
  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('[Auth] signOut error:', err);
    } finally {
      clearSession();
    }
  };

  // ─── updateProfile ─────────────────────────────────────────────
  const updateProfile = (updates: Partial<Profile>) => {
    if (profile) {
      const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updated);
      if (user) {
        try {
          localStorage.setItem('edubot_user', JSON.stringify({ user, profile: updated }));
        } catch { /* ignore */ }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signInWithGoogle, sendOtp, verifyOtp, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
