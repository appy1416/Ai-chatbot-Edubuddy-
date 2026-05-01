'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineMicrophone,
  HiOutlineDocumentArrowUp,
  HiOutlineDocumentText,
  HiOutlinePlayCircle,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiArrowRight
} from 'react-icons/hi2';

const features = [
  { icon: <HiOutlineChatBubbleLeftRight size={24} />, title: 'Instant Clarification', desc: 'Ask complex questions and receive immediate, easy-to-understand academic explanations.' },
  { icon: <HiOutlineDocumentArrowUp size={24} />, title: 'Context-Aware Uploads', desc: 'Upload your notes or images, and the AI will answer questions directly from your materials.' },
  { icon: <HiOutlineDocumentText size={24} />, title: 'Smart Summaries', desc: 'Instantly generate structured study notes and bulleted summaries for quick revision.' },
  { icon: <HiOutlinePlayCircle size={24} />, title: 'Curated Media', desc: 'Automatically receive highly relevant YouTube video links tailored to the topic you are learning.' },
];

export default function LandingPage() {
  return (
    <div className="landing-page-wrapper">
      
      {/* Hero Section */}
      <section className="hero-section py-5 px-4 overflow-hidden position-relative d-flex align-items-center" style={{ minHeight: '90vh' }}>
        <div className="container position-relative z-1">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-100)', fontSize: '0.85rem', fontWeight: 700 }}>
                <HiOutlineSparkles size={18} />
                <span>Next-Generation AI Student Companion</span>
              </div>
              <h1 className="fw-900 mb-4" style={{ fontSize: 'calc(2.5rem + 1.5vw)', letterSpacing: '-0.04em', lineHeight: 1.1, color: 'var(--neutral-900)' }}>
                Master your studies with <span className="text-brand-600">EduBot</span>
              </h1>
              <p className="lead text-muted mb-5" style={{ maxWidth: '540px', fontSize: '1.2rem', lineHeight: 1.6 }}>
                Revolutionize the way you learn with instant summaries, context-aware chatting, and personalized AI-driven study materials.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/signup" className="btn btn-premium-primary px-5 py-3 shadow-lg" style={{ fontSize: '1.1rem' }}>
                  Get Started Free <HiArrowRight className="ms-2" />
                </Link>
                <Link href="/login" className="btn btn-premium-secondary px-5 py-3" style={{ fontSize: '1.1rem' }}>
                  Student Login
                </Link>
              </div>
            </div>
            
            <div className="col-lg-6 position-relative ps-lg-5">
              <div className="card-premium p-4 shadow-xl border-0 overflow-hidden" style={{ borderRadius: 'var(--radius-2xl)', background: 'var(--brand-600)', transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)' }}>
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-white border-opacity-20 pb-3">
                  <div className="d-flex gap-1">
                    <div className="rounded-circle bg-white bg-opacity-20" style={{ width: '12px', height: '12px' }}></div>
                    <div className="rounded-circle bg-white bg-opacity-20" style={{ width: '12px', height: '12px' }}></div>
                    <div className="rounded-circle bg-white bg-opacity-20" style={{ width: '12px', height: '12px' }}></div>
                  </div>
                  <HiOutlineAcademicCap size={24} className="text-white opacity-50" />
                </div>
                <div className="p-5 text-center text-white">
                  <HiOutlineLightBulb size={80} className="mb-4 opacity-50" />
                  <h3 className="fw-800 mb-2">Smart Learning</h3>
                  <p className="opacity-70 mx-auto" style={{ maxWidth: '300px' }}>Your AI tutor is analyzing your notes and generating insights...</p>
                </div>
              </div>
              
              {/* Removed floating badges as requested */}
            </div>
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="position-absolute" style={{ top: '-10%', right: '-5%', width: '40%', height: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>
        <div className="position-absolute" style={{ bottom: '-10%', left: '-5%', width: '40%', height: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>
      </section>

      {/* Features Grid */}
      <section className="features-section py-5 px-4 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="section-label">Capabilities</span>
            <h2 className="fw-900 h1 mt-2">Why students love EduBot</h2>
          </div>
          
          <div className="row g-4">
            {features.map((feature, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="card-premium h-100 p-4 border-0 hover-lift bg-white">
                  <div 
                    className="rounded-4 d-flex align-items-center justify-content-center mb-4 text-brand-600 shadow-sm" 
                    style={{ background: 'var(--brand-50)', width: '56px', height: '56px' }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="h5 fw-800 mb-3 text-dark">{feature.title}</h3>
                  <p className="text-muted small mb-0 mt-2" style={{ lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx global>{`
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1) !important;
          border: 1px solid var(--brand-100) !important;
        }
      `}</style>
    </div>
  );
}
