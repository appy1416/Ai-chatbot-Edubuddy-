'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
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

// MVP: Local auth state (swap with Supabase when keys are configured)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const stored = localStorage.getItem('edubot_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { user: AuthUser; profile: Profile };
        if (parsed.user) setUser(parsed.user);
        if (parsed.profile) setProfile(parsed.profile);
      } catch {
        localStorage.removeItem('edubot_user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Try Supabase first
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: error.message };
        if (data.user) {
          const u = { id: data.user.id, email: data.user.email || email };
          const p: Profile = {
            id: u.id, email: u.email, full_name: fullName,
            education_level: 'degree' as EducationLevel,
            preferred_language: 'english' as SupportedLanguage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(u);
          setProfile(p);
          localStorage.setItem('edubot_user', JSON.stringify({ user: u, profile: p }));
        }
        return { error: null };
      }

      // MVP fallback: local auth
      const id = crypto.randomUUID();
      const u = { id, email };
      const p: Profile = {
        id, email, full_name: fullName,
        education_level: 'degree' as EducationLevel,
        preferred_language: 'english' as SupportedLanguage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in users list for future logins
      const storedUsers = localStorage.getItem('edubot_users');
      const users = storedUsers ? JSON.parse(storedUsers) : {};
      users[email] = { user: u, profile: p, password };
      localStorage.setItem('edubot_users', JSON.stringify(users));

      setUser(u);
      setProfile(p);
      localStorage.setItem('edubot_user', JSON.stringify({ user: u, profile: p }));
      return { error: null };
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (data.user) {
          const u = { id: data.user.id, email: data.user.email || email };
          const p: Profile = {
            id: u.id, email: u.email, full_name: email.split('@')[0],
            education_level: 'degree' as EducationLevel,
            preferred_language: 'english' as SupportedLanguage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(u);
          setProfile(p);
          localStorage.setItem('edubot_user', JSON.stringify({ user: u, profile: p }));
        }
        return { error: null };
      }

      // MVP fallback
      const stored = localStorage.getItem('edubot_users');
      const users = stored ? JSON.parse(stored) : {};
      
      if (users[email]) {
        if (users[email].password === password) {
          setUser(users[email].user);
          setProfile(users[email].profile);
          localStorage.setItem('edubot_user', JSON.stringify({ user: users[email].user, profile: users[email].profile }));
          return { error: null };
        } else {
          return { error: 'Invalid password' };
        }
      }

      // If user doesn't exist in our "mock DB", create them on the fly (legacy behavior for ease of testing)
      const id = crypto.randomUUID();
      const u = { id, email };
      const p: Profile = {
        id, email, full_name: email.split('@')[0],
        education_level: 'degree' as EducationLevel,
        preferred_language: 'english' as SupportedLanguage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(u);
      setProfile(p);
      localStorage.setItem('edubot_user', JSON.stringify({ user: u, profile: p }));
      return { error: null };
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) return { error: error.message };
        return { error: null }; // Redirect happens automatically
      }
      
      // MVP Mock for Local Testing
      await new Promise(res => setTimeout(res, 800));
      const id = crypto.randomUUID();
      const email = 'google-user@example.com';
      const u = { id, email };
      const p: Profile = {
        id, email, full_name: 'Google User',
        education_level: 'degree' as EducationLevel,
        preferred_language: 'english' as SupportedLanguage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(u);
      setProfile(p);
      localStorage.setItem('edubot_user', JSON.stringify({ user: u, profile: p }));
      return { error: null };
    } catch {
      return { error: 'An unexpected error occurred during Google sign-in' };
    }
  };

  const sendOtp = async (email: string) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) return { error: error.message };
        return { error: null };
      }
      // MVP Mock: Just delay and return success
      await new Promise(res => setTimeout(res, 800));
      return { error: null };
    } catch {
      return { error: 'An unexpected error occurred sending OTP' };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
        const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
        if (error) return { error: error.message };
        if (data.user) {
          const u = { id: data.user.id, email: data.user.email || email };
          const p: Profile = {
            id: u.id, email: u.email, full_name: email.split('@')[0],
            education_level: 'degree' as EducationLevel,
            preferred_language: 'english' as SupportedLanguage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(u);
          setProfile(p);
          localStorage.setItem('edubot_user', JSON.stringify({ user: u, profile: p }));
        }
        return { error: null };
      }
      
      // MVP Mock: accept '123456' or any 6 digit code for ease of testing
      await new Promise(res => setTimeout(res, 800));
      if (token.length !== 6) return { error: 'Invalid Code' };
      
      const id = crypto.randomUUID();
      const u = { id, email };
      const p: Profile = {
        id, email, full_name: email.split('@')[0],
        education_level: 'degree' as EducationLevel,
        preferred_language: 'english' as SupportedLanguage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(u);
      setProfile(p);
      localStorage.setItem('edubot_user', JSON.stringify({ user: u, profile: p }));
      return { error: null };
    } catch {
      return { error: 'An unexpected error occurred verifying OTP' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('edubot_user');
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (profile) {
      const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updated);
      if (user) {
        localStorage.setItem('edubot_user', JSON.stringify({ user, profile: updated }));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signInWithGoogle, sendOtp, verifyOtp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
