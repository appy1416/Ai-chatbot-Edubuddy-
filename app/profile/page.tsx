'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiSave } from 'react-icons/fi';
import type { EducationLevel, SupportedLanguage } from '@/types';

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

const languages: { value: SupportedLanguage; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'hindi', label: 'Hindi' },
];

export default function ProfilePage() {
  const { user, profile, loading, updateProfile, signOut } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(profile?.education_level || 'degree');
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>(profile?.preferred_language || 'english');
  const [saved, setSaved] = useState(false);
  const [prevProfile, setPrevProfile] = useState(profile);

  if (profile && profile !== prevProfile) {
    setPrevProfile(profile);
    setFullName(profile.full_name || '');
    setEmail(profile.email || '');
    setEducationLevel(profile.education_level || 'degree');
    setPreferredLanguage(profile.preferred_language || 'english');
  }

  const handleSave = () => {
    updateProfile({
      full_name: fullName,
      education_level: educationLevel,
      preferred_language: preferredLanguage,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'var(--neutral-50)' }}>
        <div className="spinner-border" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '900px' }}>
      
      <div className="page-header mb-5">
        <span className="section-label">Account</span>
        <h1 className="fw-900">Profile</h1>
        <p className="text-muted">Manage your account and learning preferences</p>
      </div>

      <div className="card border-0 bg-white rounded-4 shadow-sm p-4 p-md-5" style={{ border: '1px solid var(--neutral-150)' }}>
        <div className="d-flex flex-column flex-md-row align-items-center gap-4 mb-5 pb-4 border-bottom" style={{ borderColor: 'var(--neutral-150)!important' }}>
          <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 shadow-sm" style={{ width: '80px', height: '80px', background: 'var(--brand-100)', color: 'var(--brand-700)', fontSize: '1.75rem', fontWeight: 700, border: '2px solid white', outline: '2px solid var(--brand-50)' }}>
            {initials}
          </div>
          <div className="text-center text-md-start">
            <h4 className="fw-bold mb-1" style={{ color: 'var(--neutral-900)' }}>{fullName || 'Student'}</h4>
            <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>{email}</p>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <label className="form-label-custom">Full Name</label>
            <input
              type="text"
              className="input-premium w-100"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label-custom">Email Address</label>
            <input
              type="email"
              className="input-premium w-100 text-muted"
              style={{ background: 'var(--neutral-50)' }}
              value={email}
              disabled
            />
          </div>
          <div className="col-md-6">
            <label className="form-label-custom">Education Level</label>
            <select
              className="input-premium w-100"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
              style={{ appearance: 'auto' }}
            >
              {educationLevels.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label-custom">Preferred Language</label>
            <select
              className="input-premium w-100"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as SupportedLanguage)}
              style={{ appearance: 'auto' }}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-4 mt-2 gap-3" style={{ borderTop: '1px solid var(--neutral-150)' }}>
          <button
            className="btn text-danger fw-bold px-4 rounded-pill"
            onClick={() => { signOut(); router.push('/'); }}
          >
            Log Out
          </button>
          <button 
            className="btn btn-premium-primary rounded-pill px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 w-100 w-md-auto justify-content-center" 
            onClick={handleSave}
          >
            <FiSave size={18} />
            {saved ? 'Saved Successfully!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
