'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HiOutlineAcademicCap, HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Surface OAuth errors passed back via query param (e.g. from /auth/callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    if (oauthError) setError(decodeURIComponent(oauthError));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address'); return; }
    
    setLoading(true);
    const result = await signIn(email, password); 
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (result.error) {
      setError(result.error);
    }
    // On success: Supabase triggers a redirect automatically; no router.push needed
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '440px', padding: '3rem 2.5rem' }}>
        
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
          <h2 className="fw-800 mb-2" style={{ letterSpacing: '-0.025em' }}>Welcome back</h2>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>Login to your student portal</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
            <span className="fw-bold">!</span> {error}
          </div>
        )}

        {/* ─── Google Sign-In ─── */}
        <button
          id="btn-google-signin-login"
          type="button"
          className="btn-google-oauth w-100 mb-4"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
        </button>

        {/* ─── Divider ─── */}
        <div className="auth-divider mb-4">
          <span>or sign in with email</span>
        </div>

        <form onSubmit={handleLogin} className="d-flex flex-column gap-4">
          <div>
            <label className="form-label-custom">Email Address</label>
            <div className="position-relative">
              <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                <HiOutlineEnvelope size={20} />
              </span>
              <input
                id="input-login-email"
                type="email"
                className="input-premium ps-5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label-custom">Password</label>
            <div className="position-relative">
              <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                <HiOutlineLockClosed size={20} />
              </span>
              <input
                id="input-login-password"
                type="password"
                className="input-premium ps-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button
            id="btn-email-signin"
            type="submit"
            className="btn btn-premium-primary w-100 py-3 mt-2"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In Now'}
          </button>
        </form>

        <div className="text-center mt-5 pt-4 border-top" style={{ borderColor: 'var(--neutral-100)' }}>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: 'var(--neutral-500)' }}>
            New to EduBot?{' '}
            <Link href="/signup" className="text-brand-600 fw-bold text-decoration-none">Create an account</Link>
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
