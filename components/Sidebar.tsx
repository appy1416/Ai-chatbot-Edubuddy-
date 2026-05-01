'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiOutlineSquares2X2, 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineDocumentText, 
  HiOutlineClock, 
  HiOutlineUserCircle,
  HiOutlineChevronLeft,
  HiOutlinePlus
} from 'react-icons/hi2';
import { FiX } from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: <HiOutlineSquares2X2 size={20} /> },
  { label: 'AI Chat', href: '/chat', icon: <HiOutlineChatBubbleLeftRight size={20} /> },
  { label: 'Smart Notes', href: '/notes', icon: <HiOutlineDocumentText size={20} /> },
  { label: 'History', href: '/history', icon: <HiOutlineClock size={20} /> },
  { label: 'Profile', href: '/profile', icon: <HiOutlineUserCircle size={20} /> },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [recentChats, setRecentChats] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const history = JSON.parse(localStorage.getItem('chatHistory_v1') || '[]');
        setRecentChats(history.slice(0, 5));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    };

    loadHistory();
    window.addEventListener('chatHistoryUpdated', loadHistory);
    return () => window.removeEventListener('chatHistoryUpdated', loadHistory);
  }, []);

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="d-flex align-items-center justify-content-between p-4 d-lg-none border-bottom mb-2">
          <span className="fw-800 text-primary">EduBot</span>
          <button className="btn p-1" onClick={onClose}><FiX size={24} /></button>
        </div>

        <div className="sidebar-content h-100 d-flex flex-column py-4">
          <div className="px-3 mb-4">
            <Link href="/chat" className="btn btn-premium-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: 'var(--radius-lg)' }}>
              <HiOutlinePlus size={18} />
              <span>New Interaction</span>
            </Link>
          </div>

          <nav className="flex-grow-1 overflow-auto">
            <div className="sidebar-section-label mb-2">Main Navigation</div>
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`sidebar-nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => { if(window.innerWidth < 1024) onClose(); }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {recentChats.length > 0 && (
              <div className="mt-5">
                <div className="sidebar-section-label mb-2">Recent Chats</div>
                {recentChats.map((chat) => (
                  <Link 
                    key={chat.id} 
                    href={`/chat?id=${chat.id}`} 
                    className="sidebar-recent-link mx-3 px-3 py-2 d-block text-truncate"
                    onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                  >
                    {chat.title}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          <div className="mt-auto px-4 pt-4 border-top">
            <div className="p-3 rounded-4" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
              <p className="small fw-bold mb-1" style={{ color: 'var(--brand-700)' }}>Free Student Plan</p>
              <div className="progress mb-2" style={{ height: '6px', background: 'rgba(0,0,0,0.05)' }}>
                <div className="progress-bar" style={{ width: '45%', background: 'var(--brand-500)' }}></div>
              </div>
              <p className="text-muted" style={{ fontSize: '0.7rem' }}>Using 4.5/10GB Storage</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-lg-none" 
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 35 }}
          onClick={onClose}
        />
      )}
    </>
  );
}
