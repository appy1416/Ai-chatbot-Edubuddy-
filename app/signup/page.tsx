'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HiOutlineAcademicCap, HiOutlineEnvelope, HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi2';
import type { EducationLevel } from '@/types';

const educationLevels: { value: EducationLevel; label: string }[] = [
  { value: 'primary', label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'intermediate', label: 'Intermediate (11th-12th)' },
  { value: 'degree', label: 'Degree / Undergraduate' },
  { value: 'btech', label: 'B.Tech' },
  { value: 'bba', label: 'BBA' },
  { value: 'mba', label: 'MBA' },
  { value: 'other', label: 'Other' },
];

export default function SignupPage() {
  const { user, loading, signUp, updateProfile, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<EducationLevel>('degree');

  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Guard: if already authenticated, redirect away ───────────────────────
  useEffect(() => {
    if (!loading && user) {
      console.log('[Signup] User already authenticated — redirecting to /dashboard');
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // ── Surface OAuth errors passed back via query param ─────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      console.error('[Signup] OAuth error param:', oauthError);
      setError(decodeURIComponent(oauthError));
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) { setError('Please fill in all details'); return; }

    setFormLoading(true);
    try {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        setError(result.error);
      } else {
        updateProfile({ education_level: level });
        console.log('[Signup] Registration successful — redirecting to /dashboard');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('[Signup] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.error) {
        console.error('[Signup] Google sign-in error:', result.error);
        setError(result.error);
        setGoogleLoading(false);
        return;
      }

      console.log('[Signup] Google sign-in returned successfully — redirecting to /dashboard');
      router.push('/dashboard');
    } catch (err) {
      console.error('[Signup] handleGoogleSignIn unexpected error:', err);
      setError('Failed to connect to Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  // Show a minimal spinner while checking persisted session
  if (loading) {
    return (
      <div className="auth-container">
        <div className="d-flex flex-column align-items-center gap-3">
          <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Checking session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '480px', padding: '3rem 2.5rem' }}>

        <div className="text-center mb-5">
          <div
            className="d-inline-flex p-3 rounded-4 mb-3"
            style={{
              background: 'var(--brand-50)',
              color: 'var(--brand-600)',
              boxShadow: '0 8px 16px -4px rgba(124, 58, 237, 0.1)'
            }}
          >
            <HiOutlineAcademicCap size={44} />
          </div>
          <h2 className="fw-800 mb-2" style={{ letterSpacing: '-0.025em' }}>Join EduBot</h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>Personalize your academic journey</p>
        </div>

        {error && (
          <div
            className="alert alert-danger py-2 px-3 mb-4 rounded-3 d-flex align-items-center gap-2"
            style={{ fontSize: '0.85rem' }}
            role="alert"
          >
            <span className="fw-bold" aria-hidden="true">!</span> {error}
          </div>
        )}

        {/* ─── Google Sign-Up ─── */}
        <button
          id="btn-google-signin-signup"
          type="button"
          className="btn-google-oauth w-100 mb-4"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || formLoading}
        >
          {googleLoading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? 'Connecting to Google…' : 'Sign up with Google'}
        </button>

        {/* ─── Divider ─── */}
        <div className="auth-divider mb-4">
          <span>or create account with email</span>
        </div>

        <form onSubmit={handleSignUp} className="d-flex flex-column gap-3" noValidate>
          <div>
            <label htmlFor="input-signup-name" className="form-label-custom">Full Name</label>
            <div className="position-relative">
              <span className="position-absolute top-50 translate-middle-y ms-3 text-muted" aria-hidden="true">
                <HiOutlineUser size={20} />
              </span>
              <input
                id="input-signup-name"
                type="text"
                className="input-premium ps-5"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Student Name"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-signup-email" className="form-label-custom">Email Address</label>
            <div className="position-relative">
              <span className="position-absolute top-50 translate-middle-y ms-3 text-muted" aria-hidden="true">
                <HiOutlineEnvelope size={20} />
              </span>
              <input
                id="input-signup-email"
                type="email"
                className="input-premium ps-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-signup-password" className="form-label-custom">Create Password</label>
            <div className="position-relative">
              <span className="position-absolute top-50 translate-middle-y ms-3 text-muted" aria-hidden="true">
                <HiOutlineLockClosed size={20} />
              </span>
              <input
                id="input-signup-password"
                type="password"
                className="input-premium ps-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-signup-level" className="form-label-custom">Education Level</label>
            <select
              id="input-signup-level"
              className="input-premium"
              value={level}
              onChange={(e) => setLevel(e.target.value as EducationLevel)}
              style={{ appearance: 'auto' }}
            >
              {educationLevels.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <button
            id="btn-email-signup"
            type="submit"
            className="btn btn-premium-primary w-100 py-3 mt-3"
            disabled={formLoading}
          >
            {formLoading ? 'Creating Account…' : 'Get Started Free'}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-top" style={{ borderColor: 'var(--neutral-100)' }}>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--neutral-500)' }}>
            Already registered?{' '}
            <Link href="/login" className="text-brand-600 fw-bold text-decoration-none">Sign In</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
