'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineDocumentText, 
  HiOutlineClock, 
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSparkles,
  HiOutlineAcademicCap
} from 'react-icons/hi2';

const DASHBOARD_LINKS = [
  { 
    title: 'AI Chatbot', 
    desc: 'Get instant answers and study help.', 
    href: '/chat', 
    icon: <HiOutlineChatBubbleLeftRight size={24} />,
    color: 'var(--brand-600)',
    bgColor: 'var(--brand-50)'
  },
  { 
    title: 'Smart Notes', 
    desc: 'Manage your study materials.', 
    href: '/notes', 
    icon: <HiOutlineDocumentText size={24} />,
    color: 'var(--accent-cyan)',
    bgColor: 'rgba(6,182,212,0.1)'
  },
  { 
    title: 'Academic History', 
    desc: 'Review your past conversations.', 
    href: '/history', 
    icon: <HiOutlineClock size={24} />,
    color: 'var(--accent-amber)',
    bgColor: 'rgba(245,158,11,0.1)'
  },
  { 
    title: 'Profile Settings', 
    desc: 'Update your learning preferences.', 
    href: '/profile', 
    icon: <HiOutlineUserCircle size={24} />,
    color: 'var(--neutral-600)',
    bgColor: 'var(--neutral-100)'
  },
];

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = React.useState({ notes: 0, chats: 0 });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      // Fetch dynamic stats
      const history = JSON.parse(localStorage.getItem('chatHistory_v1') || '[]');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      fetch('/api/notes', { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          clearTimeout(timeoutId);
          setStats({ notes: data.notes?.length || 0, chats: history.length });
        })
        .catch(() => {
          clearTimeout(timeoutId);
          setStats({ notes: 0, chats: history.length });
        });
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'var(--neutral-50)' }}>
        <div className="spinner-border" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Learner';

  return (
    <div className="container-fluid py-4">
      
      {/* Welcome Banner */}
      <div 
        className="card border-0 shadow-sm p-4 p-md-5 mb-5 overflow-hidden position-relative" 
        style={{ 
          borderRadius: 'var(--radius-2xl)', 
          background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-400) 100%)',
          color: 'white'
        }}
      >
        <div className="position-relative z-1" style={{ maxWidth: '600px' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 700 }}>
              {profile?.education_level?.toUpperCase() || 'STUDENT'} PLAN
            </span>
          </div>
          <h1 className="fw-900 mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>
            Hello, {firstName}!
          </h1>
          <p className="opacity-90 lead mb-0">
            Ready to master your studies today? Your AI assistant is online and ready to help you with your latest assignments.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="position-absolute" style={{ right: '-50px', bottom: '-50px', opacity: 0.15 }}>
          <HiOutlineAcademicCap size={300} />
        </div>
        <div className="position-absolute" style={{ right: '10%', top: '10%', opacity: 0.1 }}>
          <HiOutlineSparkles size={100} />
        </div>
      </div>

      <div className="section-label">Quick Actions</div>
      <div className="row g-4 mb-5">
        {DASHBOARD_LINKS.map((link) => (
          <div key={link.href} className="col-md-6 col-lg-3">
            <Link href={link.href} className="text-decoration-none h-100 d-block">
              <div className="card-premium h-100 p-4 d-flex flex-column align-items-center text-center">
                <div 
                  className="rounded-4 d-flex align-items-center justify-content-center mb-3" 
                  style={{ 
                    background: link.bgColor, 
                    color: link.color,
                    width: '60px',
                    height: '60px'
                  }}
                >
                  {link.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--neutral-900)' }}>{link.title}</h3>
                <p className="text-muted small mb-0 mt-1">{link.desc}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card-premium h-100 p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="fw-800 m-0">Learning Progress</h4>
              <button className="btn btn-sm btn-premium-secondary">View Analysis</button>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <div className="p-4 rounded-4 text-center" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
                  <h2 className="fw-900 mb-0" style={{ color: 'var(--brand-600)' }}>{stats.chats}</h2>
                  <p className="small text-muted mb-0">Total Chats</p>
                </div>
              </div>
              <div className="col-6">
                <div className="p-4 rounded-4 text-center" style={{ background: 'var(--accent-cyan-light)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <h2 className="fw-900 mb-0" style={{ color: 'var(--accent-cyan)' }}>{stats.notes}</h2>
                  <p className="small text-muted mb-0">Saved Notes</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 text-center bg-light rounded-4 border border-dashed">
              <HiOutlineSparkles size={32} className="text-muted mb-3 opacity-50" />
              <p className="text-muted mb-0">
                {stats.chats > 0 
                  ? "Great job! You're making progress with your AI learning assistant." 
                  : "Your personalized learning metrics will appear here once you start chatting!"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card-premium h-100 p-4" style={{ background: 'var(--neutral-0)' }}>
            <h4 className="fw-800 mb-4">Pro Tip</h4>
            <div className="p-3 rounded-4 mb-3" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
              <p className="small mb-0" style={{ color: 'var(--brand-700)', lineHeight: 1.6 }}>
                <strong>Did you know?</strong> You can upload PDFs directly to the chat to get instant summaries and key concepts extracted!
              </p>
            </div>
            <Link href="/chat" className="btn btn-premium-primary w-100 mt-auto">Try it now</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
