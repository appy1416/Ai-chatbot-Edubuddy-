'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HiOutlineAcademicCap, HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



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

        <form onSubmit={handleLogin} className="d-flex flex-column gap-4">
          <div>
            <label className="form-label-custom">Email Address</label>
            <div className="position-relative">
              <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                <HiOutlineEnvelope size={20} />
              </span>
              <input
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
                type="password"
                className="input-premium ps-5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-premium-primary w-100 py-3 mt-2" disabled={loading}>
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
