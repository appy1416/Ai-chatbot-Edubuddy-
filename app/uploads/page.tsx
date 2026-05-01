'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlinePlus,
} from 'react-icons/hi2';

interface UploadItem {
  id: string;
  name: string;
  type: 'image' | 'document';
  size: string;
  date: string;
}

export default function UploadsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newUploads: UploadItem[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      type: f.type.startsWith('image/') ? 'image' : 'document',
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toISOString().split('T')[0],
    }));
    setUploads((prev) => [...newUploads, ...prev]);
  };

  const deleteUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

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
          <span className="section-label">Resources</span>
          <h1 className="fw-900">Uploads</h1>
          <p className="text-muted">Documents and images for AI-assisted learning</p>
        </div>
        <button className="btn btn-premium-primary px-4 py-2 shadow-sm d-inline-flex align-items-center gap-2 fw-bold" onClick={() => fileInputRef.current?.click()}>
          <HiOutlinePlus size={18} /> New Upload
        </button>
      </div>

      {/* Upload Zone */}
      <div
        className="card border-0 bg-white rounded-4 shadow-sm mb-5 text-center overflow-hidden position-relative"
        style={{ 
          border: `2px dashed ${dragOver ? 'var(--brand-500)' : 'var(--neutral-200)'}!important`, 
          background: dragOver ? 'var(--brand-50)' : 'var(--neutral-0)',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="p-5">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 64, height: 64, background: dragOver ? 'var(--brand-100)' : 'var(--neutral-100)', color: dragOver ? 'var(--brand-600)' : 'var(--neutral-400)', transition: 'all 0.2s' }}>
            <HiOutlineCloudArrowUp size={32} />
          </div>
          <h5 className="fw-bold mb-2" style={{ color: 'var(--neutral-900)' }}>Drop files here or click to upload</h5>
          <p className="mb-0" style={{ fontSize: '0.95rem', color: 'var(--neutral-500)' }}>
            Supports images (PNG, JPG) and documents (PDF, DOCX, TXT, PPT)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Uploads List */}
      <div className="section-label mb-3">Your Files</div>
      
      {uploads.length > 0 ? (
        <div className="row g-3">
          {uploads.map((u) => (
            <div key={u.id} className="col-12 col-md-6 col-xl-4">
              <div 
                className="card border-0 bg-white rounded-4 shadow-sm d-flex flex-row align-items-center gap-3 p-3 w-100"
                style={{ border: '1px solid var(--neutral-150)', transition: 'all 0.2s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px', background: u.type === 'image' ? '#EEF2FF' : '#FEF3C7', color: u.type === 'image' ? '#4F46E5' : '#D97706' }}>
                  {u.type === 'image' ? <HiOutlinePhoto size={24} /> : <HiOutlineDocumentText size={24} />}
                </div>
                <div className="flex-grow-1 min-w-0">
                  <h6 className="text-truncate mb-1" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--neutral-900)' }}>{u.name}</h6>
                  <div className="d-flex flex-wrap align-items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                    <span className="fw-medium">{u.size}</span>
                    <span>&bull;</span>
                    <span className="d-flex align-items-center gap-1"><HiOutlineClock size={14} /> {u.date}</span>
                  </div>
                </div>
                <button 
                  className="btn btn-light rounded-circle p-2 border shadow-sm ms-auto flex-shrink-0" 
                  style={{ color: 'var(--neutral-500)' }} 
                  onClick={(e) => { e.preventDefault(); deleteUpload(u.id); }}
                >
                  <HiOutlineTrash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card border-0 bg-white rounded-4 shadow-sm p-4 border" style={{ border: '1px dashed var(--neutral-200)!important' }}>
          <p className="text-center mb-0" style={{ color: 'var(--neutral-500)', fontSize: '0.95rem' }}>No files uploaded yet. Use the upload zone above to add documents.</p>
        </div>
      )}
    </div>
  );
}
