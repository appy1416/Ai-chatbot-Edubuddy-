'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiSearch } from 'react-icons/fi';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineTrash,
} from 'react-icons/hi2';

interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
  messages: { role: string; content: string }[];
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Load real chat history from localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('chatHistory_v1') || '[]');
        setHistory(stored);
      } catch (e) {
        console.error('Failed to load history', e);
      }
    };

    loadHistory();
    window.addEventListener('chatHistoryUpdated', loadHistory);
    return () => window.removeEventListener('chatHistoryUpdated', loadHistory);
  }, []);

  if (loading || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'var(--neutral-50)' }}>
        <div className="spinner-border" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  const filtered = history.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase())
  );

  const deleteChat = (id: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem('chatHistory_v1') || '[]');
      const updated = stored.filter((c: ChatHistoryItem) => c.id !== id);
      localStorage.setItem('chatHistory_v1', JSON.stringify(updated));
      setHistory(updated);
      window.dispatchEvent(new Event('chatHistoryUpdated'));
    } catch (e) {
      console.error('Failed to delete chat', e);
    }
  };

  return (
    <div className="container-fluid py-4">

      <div className="page-header mb-5">
        <span className="section-label">Archive</span>
        <h1 className="fw-900">Chat History</h1>
        <p className="text-muted">Revisit your previous learning conversations</p>
      </div>

      {/* Search Bar */}
      <div className="position-relative mb-4" style={{ maxWidth: '450px' }}>
        <FiSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} size={18} />
        <input
          type="text"
          className="form-control rounded-pill shadow-sm bg-white"
          style={{ padding: '0.75rem 1.25rem 0.75rem 2.75rem', border: '1px solid var(--neutral-200)', fontSize: '0.95rem' }}
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* History List */}
      {filtered.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {filtered.map((h) => (
            <div key={h.id} className="d-flex align-items-center gap-3">
              <Link href={`/chat?id=${h.id}`} className="text-decoration-none flex-grow-1">
                <div 
                  className="card border-0 bg-white rounded-4 shadow-sm p-3 p-md-4 d-flex flex-row align-items-center gap-3 w-100"
                  style={{ border: '1px solid var(--neutral-150)', transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div className="d-flex align-items-center justify-content-center bg-light rounded-circle flex-shrink-0" style={{ width: '48px', height: '48px', color: 'var(--brand-500)' }}>
                    <HiOutlineChatBubbleLeftRight size={24} />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <h6 className="text-truncate mb-1" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--neutral-900)' }}>{h.title}</h6>
                    <div className="d-flex flex-wrap align-items-center gap-3" style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
                      <span className="d-flex align-items-center gap-1"><HiOutlineClock size={16} /> {new Date(h.date).toLocaleDateString()}</span>
                      <span>{h.messages?.length || 0} messages</span>
                    </div>
                  </div>
                </div>
              </Link>
              <button 
                className="btn btn-light rounded-circle p-2 border shadow-sm flex-shrink-0" 
                style={{ color: 'var(--neutral-500)' }} 
                onClick={() => deleteChat(h.id)}
                title="Delete conversation"
              >
                <HiOutlineTrash size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 bg-white rounded-4 shadow-sm p-5 text-center mt-4" style={{ border: '1px solid var(--neutral-150)' }}>
          <HiOutlineClock size={48} style={{ color: 'var(--neutral-300)', margin: '0 auto 1.25rem' }} />
          <h5 style={{ fontWeight: 700, color: 'var(--neutral-900)' }}>
            {history.length === 0 ? 'No Conversations Yet' : 'No History Found'}
          </h5>
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.95rem', margin: '0 auto 1.5rem', maxWidth: '300px' }}>
            {history.length === 0 
              ? 'Start a conversation with the AI to see your history here.'
              : 'We couldn\'t find any conversations matching your search. Try different keywords.'}
          </p>
          <Link href="/chat" className="btn btn-premium-primary rounded-pill px-4 py-2 shadow-sm d-inline-flex mx-auto fw-bold">Start a Chat</Link>
        </div>
      )}
    </div>
  );
}
