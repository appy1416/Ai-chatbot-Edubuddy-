'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authenticated routes that should show the sidebar
  const isLanding = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const showSidebar = !!(user && !isLanding && !isAuthPage);

  // Debug log to ensure layout state is correct
  useEffect(() => {
    console.log('Layout State:', { showSidebar, user: !!user, pathname });
  }, [showSidebar, user, pathname]);

  return (
    <div className="app-shell">
      {showSidebar && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}
      
      <div className="main-container">
        {!isAuthPage && <Navbar onMenuClick={() => setSidebarOpen(true)} showSidebarToggle={showSidebar} />}
        
        <main className={showSidebar ? 'content-area' : ''}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        .app-shell {
          display: flex;
          background: var(--neutral-50);
          min-height: 100vh;
        }
        
        .main-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Prevents flex items from overflowing */
        }

        .content-area {
          padding-top: 80px; /* Space for navbar */
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .content-area {
            padding: 80px 1rem 2rem;
          }
        }
      `}</style>
    </div>
  );
}
