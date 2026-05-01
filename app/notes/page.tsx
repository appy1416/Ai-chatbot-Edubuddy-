'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiPlus } from 'react-icons/fi';
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineTrash,
  HiOutlineArchiveBox,
} from 'react-icons/hi2';
import type { Note } from '@/types';

export default function NotesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch real notes from API
  const fetchNotes = async () => {
    setIsFetching(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch('/api/notes', { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes);
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch notes', e);
    } finally {
      setIsFetching(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' });
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (e) {
      console.error('Failed to delete note', e);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchNotes();
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'var(--neutral-50)' }}>
        <div className="spinner-border" style={{ color: 'var(--brand-500)' }} />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      
      <div className="d-flex flex-column flex-md-row align-items-start justify-content-between mb-5 gap-3">
        <div className="page-header mb-0">
          <span className="section-label">Notebook</span>
          <h1 className="fw-900">Saved Notes</h1>
          <p className="text-muted">Review and manage your generated study materials</p>
        </div>
        <Link href="/chat" className="btn btn-premium-primary px-4 py-2 shadow-sm d-inline-flex align-items-center gap-2 fw-bold">
          <FiPlus size={18} /> Generate New
        </Link>
      </div>

      {isFetching ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-3 text-muted">Loading your notebook...</p>
        </div>
      ) : notes.length > 0 ? (
        <div className="row g-4">
          {notes.map((note) => (
            <div key={note.id} className="col-12 col-md-6 col-xl-4">
              <div 
                className="card-premium h-100 p-4 d-flex flex-column"
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="badge rounded-pill px-3 py-1" style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', fontWeight: 700, fontSize: '0.7rem' }}>
                    {(note.subject || 'general').toUpperCase()}
                  </span>
                  <button 
                    className="btn btn-sm text-muted p-0 opacity-50 hover-opacity-100" 
                    title="Delete note"
                    onClick={() => deleteNote(note.id)}
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
                
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--neutral-900)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                  {note.title}
                </h3>
                <p className="flex-grow-1" style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {(note.content || '').slice(0, 150)}{(note.content || '').length > 150 ? '...' : ''}
                </p>
                
                <div className="mt-auto d-flex align-items-center justify-content-between pt-3 border-top" style={{ borderColor: 'var(--neutral-100)' }}>
                  <span className="d-flex align-items-center gap-2 text-muted fw-500" style={{ fontSize: '0.8rem' }}>
                    <HiOutlineClock size={16} /> {new Date(note.created_at).toLocaleDateString()}
                  </span>
                  <button className="btn btn-sm btn-premium-secondary py-1 px-3 d-flex align-items-center gap-2">
                    Read <HiOutlineDocumentText size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-premium p-5 text-center bg-white">
          <div className="d-inline-flex p-4 rounded-circle bg-light mb-4 text-muted">
            <HiOutlineArchiveBox size={48} />
          </div>
          <h2 className="fw-800" style={{ fontSize: '1.5rem' }}>Your notebook is empty</h2>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '400px' }}>
            Whenever you ask the AI to generate study notes from a conversation, they will be saved here for easy revision.
          </p>
          <Link href="/chat" className="btn btn-premium-primary px-4">Start a Conversation</Link>
        </div>
      )}

      <style jsx>{`
        .hover-opacity-100:hover {
          opacity: 1 !important;
          color: var(--error) !important;
        }
      `}</style>
    </div>
  );
}
