'use client';

import React, { useState } from 'react';
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
  const { signUp, updateProfile } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<EducationLevel>('degree');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password) { setError('Please fill in all details'); return; }
    
    setLoading(true);
    const result = await signUp(email, password, fullName);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      updateProfile({ education_level: level });
      setLoading(false);
      router.push('/dashboard');
    }
  };

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
          <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
            <span className="fw-bold">!</span> {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label-custom">Full Name</label>
            <div className="position-relative">
              <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                <HiOutlineUser size={20} />
              </span>
              <input
                type="text"
                className="input-premium ps-5"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Student Name"
                required
              />
            </div>
          </div>

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
            <label className="form-label-custom">Create Password</label>
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

          <div>
            <label className="form-label-custom">Education Level</label>
            <select
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
          
          <button type="submit" className="btn btn-premium-primary w-100 py-3 mt-3" disabled={loading}>
            {loading ? 'Creating Account...' : 'Get Started Free'}
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
