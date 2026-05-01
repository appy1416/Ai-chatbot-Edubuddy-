'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi2';

interface NavbarProps {
  onMenuClick?: () => void;
  showSidebarToggle?: boolean;
}

export default function Navbar({ onMenuClick, showSidebarToggle }: NavbarProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const isLanding = pathname === '/';
  const isAuth = pathname === '/login' || pathname === '/signup';
  const isDashboard = !isLanding && !isAuth && user;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    // Theme initialization
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') || 'light';
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  if (isAuth) return null;

  return (
    <nav 
      className={`navbar navbar-expand-lg fixed-top shadow-sm ${scrolled ? 'scrolled' : ''}`}
      style={{ 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid var(--neutral-150)',
        height: '64px',
        zIndex: 50,
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container-fluid px-3 px-lg-4 d-flex align-items-center h-100">
        <div className="d-flex align-items-center gap-2">
          {showSidebarToggle && (
            <button 
              className="btn d-lg-none p-1 me-2 text-dark" 
              onClick={onMenuClick}
              aria-label="Toggle Sidebar"
            >
              <FiMenu size={22} />
            </button>
          )}
          <Link href={user ? '/dashboard' : '/'} className="navbar-brand d-flex align-items-center gap-2 m-0 p-0">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center" 
              style={{ background: 'var(--brand-600)', width: '36px', height: '36px', color: 'white' }}
            >
              <HiOutlineAcademicCap size={22} />
            </div>
            <span className="navbar-brand-text h4 mb-0" style={{ color: 'var(--neutral-900)', fontWeight: 800 }}>EduBot</span>
          </Link>
        </div>

        {/* This div pushes everything after it to the right */}
        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Desktop Theme Toggle */}
          <button 
            className="btn btn-premium-secondary d-none d-lg-flex p-2" 
            onClick={toggleTheme} 
            title="Toggle theme"
            style={{ width: '36px', height: '36px', borderRadius: '50%', color: 'var(--neutral-600)' }}
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {!user && isLanding && (
            <div className="d-none d-lg-flex align-items-center gap-2">
              <Link href="/login" className="btn btn-premium-secondary">Log In</Link>
              <Link href="/signup" className="btn btn-premium-primary">Sign Up Free</Link>
            </div>
          )}

          {user && (
            <div className="d-flex align-items-center gap-3">
              <button 
                onClick={signOut} 
                className="btn btn-premium-secondary d-none d-sm-flex align-items-center gap-2"
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-lg)' }}
              >
                Log Out
              </button>
              <button 
                className="btn d-lg-none p-2 text-dark" 
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle Mobile Menu"
              >
                {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu dropdown - moved outside the main flex flow to prevent alignment issues */}
        {mobileOpen && (
          <div className="collapse show position-absolute top-100 start-0 w-100 bg-white border-bottom shadow-sm" style={{ zIndex: 1000 }}>
            <ul className="navbar-nav w-100 p-3 gap-2">
               {!user ? (
                 <>
                   <li className="nav-item"><Link href="/login" className="nav-link">Log In</Link></li>
                   <li className="nav-item"><Link href="/signup" className="nav-link">Sign Up Free</Link></li>
                 </>
               ) : (
                 <>
                   <li className="nav-item"><Link href="/dashboard" className="nav-link">Dashboard</Link></li>
                   <li className="nav-item"><button onClick={signOut} className="nav-link w-100 text-start border-0 bg-transparent">Log Out</button></li>
                 </>
               )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
